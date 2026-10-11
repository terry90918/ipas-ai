import importlib.util
import json
import hashlib
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts' / 'extract_questions.py'

class ExtractionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec = importlib.util.spec_from_file_location('extract_questions', SCRIPT)
        cls.module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.module)

    def test_options_preserve_line_breaks_and_formula(self):
        stem, options = self.module.split_options('求機率\nP(A|B) = P(A∩B)/P(B)\n(A)第一項\n續行\n(B)第二項\n(C)第三項\n(D)第四項')
        self.assertIn('P(A|B)', stem)
        self.assertEqual(options['A'], '第一項\n續行')
        self.assertEqual(options['D'], '第四項')

    def test_inline_options(self):
        stem, options = self.module.split_options('結果為何？\n(A)1；(B)2；(C)3；(D)4')
        self.assertEqual(stem, '結果為何？')
        self.assertEqual(options, {'A': '1；', 'B': '2；', 'C': '3；', 'D': '4'})

    def test_code_placeholders_in_stem_are_not_options(self):
        text = '為符合10類單標籤需求，程式碼(A)與(B)的函數應填何者？\n(A)sigmoid，mean_squared_error；\n(B)softmax，categorical_crossentropy；\n(C)relu，binary_crossentropy；\n(D)tanh，sparse_categorical_crossentropy'
        stem, options = self.module.split_options(text)
        self.assertIn('程式碼(A)與(B)', stem)
        self.assertEqual(options['A'], 'sigmoid，mean_squared_error；')
        self.assertEqual(options['B'], 'softmax，categorical_crossentropy；')

    def test_single_line_reference_is_retained_in_stem(self):
        text = '觀察程式中行(A)將所有既有權重的梯度計算關閉，屬何種策略？\n(A)全面微調；\n(B)零樣本學習；\n(C)特徵萃取；\n(D)知識蒸餾'
        stem, options = self.module.split_options(text)
        self.assertIn('行(A)將所有既有權重', stem)
        self.assertEqual(options['A'], '全面微調；')

    def test_deterministic_exam_id(self):
        info = self.module.exam_metadata(Path('初級/115年/第3次/第1科_人工智慧基礎概論_歷屆考題.pdf'))
        self.assertEqual(info['id'], 'beginner-115-3-1')
        self.assertEqual(info['subjectNumber'], 1)

    def test_missing_option_is_retained(self):
        stem, options = self.module.split_options('圖中選項\n(A)文字\n(C)另一選項\n(D)末項')
        self.assertEqual(options['B'], '')
        self.assertEqual(stem, '圖中選項')

class CorpusTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        content = SCRIPT.parents[1] / 'content'
        cls.questions = json.loads((content / 'questions.json').read_text())
        cls.exams = json.loads((content / 'exams.json').read_text())
        cls.audit = json.loads((content / 'extraction-audit.json').read_text())

    def test_complete_source_inventory(self):
        self.assertEqual(len(self.exams), 14)
        self.assertEqual(len(self.questions), 700)
        self.assertEqual(len({q['id'] for q in self.questions}), 700)
        for exam in self.exams:
            items = [q for q in self.questions if q['examId'] == exam['id']]
            self.assertEqual([q['number'] for q in items], list(range(1, 51)))
            self.assertEqual(exam['questionCount'], 50)
            self.assertTrue(all(q['answer'] in 'ABCD' and len(q['answer']) == 1 for q in items))
            self.assertTrue(all(q['stem'] and q['images'] and q['pages'] for q in items))

    def test_all_original_images_and_papers_exist(self):
        public = SCRIPT.parents[1] / 'public'
        for question in self.questions:
            for image in question['images']:
                self.assertTrue((public / image.lstrip('/')).is_file(), image)
        for exam in self.audit['exams']:
            paper = public / 'papers' / f"{exam['examId']}.pdf"
            self.assertEqual(hashlib.sha256(paper.read_bytes()).hexdigest(), exam['sourceSha256'])

    def test_four_shared_ranges_from_independent_source_fixtures(self):
        fixtures = [
            ('intermediate-114-2-2', 43, 47, 'vgsales.csv', [13], 42),
            ('intermediate-114-2-2', 48, 50, 'marketing.csv', [15, 16], 47),
            ('intermediate-114-2-3', 42, 45, 'VGG16 是由', [11, 12, 13], 41),
            ('intermediate-114-2-3', 46, 47, '8×8', [14, 15], 45),
        ]
        for exam, start, end, keyword, pages, previous in fixtures:
            with self.subTest(exam=exam, start=start, end=end):
                prefix = f'/assets/questions/{exam}-context{start}-{end}-'
                for number in range(start, end + 1):
                    question = next(q for q in self.questions if q['id'] == f'{exam}-q{number}')
                    self.assertIn(keyword, question['stem'])
                    self.assertTrue(set(pages).issubset(question['pages']))
                    self.assertTrue(any(image.startswith(prefix) for image in question['images']))
                predecessor = next(q for q in self.questions if q['id'] == f'{exam}-q{previous}')
                self.assertFalse(any(keyword in option for option in predecessor['options'].values()))

    def test_option_text_does_not_contain_shared_question_ranges(self):
        import re
        for question in self.questions:
            for text in question['options'].values():
                self.assertIsNone(re.search(r'\d+\s*[~～至-]\s*\d+\s*題', text), question['id'])

    def test_vgg16_image_options_preserve_distinct_freezing_targets(self):
        question = next(q for q in self.questions if q['id'] == 'intermediate-114-2-3-q45')
        self.assertIn('model.parameters()', question['options']['A'])
        self.assertIn('model.features.parameters()', question['options']['B'])
        self.assertIn('model.classifier.parameters()', question['options']['C'])
        self.assertIn('model.requires_grad = False', question['options']['D'])
        self.assertTrue(any('-q45-p14-s2.webp' in image for image in question['images']))

    def test_shared_context_is_attached_to_every_question(self):
        for exam in self.audit['exams']:
            for group in exam['sharedContexts']:
                for number in range(group['start'], group['end'] + 1):
                    question = next(q for q in self.questions if q['id'] == f"{exam['examId']}-q{number}")
                    self.assertTrue(set(group['images']).issubset(question['images']))
                    self.assertTrue(all(part in question['stem'] for part in group['parts']))

    def test_image_only_options_have_verified_transcription(self):
        question = next(q for q in self.questions if q['id'] == 'intermediate-115-1-2-q49')
        self.assertIn("train_test_split(X_norm, y", question['options']['B'])
        self.assertIn('solver="lbfgs"', question['options']['B'])
        self.assertIn("train_test_split(y, X_norm", question['options']['D'])
        self.assertTrue(all(q['options'][letter] for q in self.questions for letter in 'ABCD'))
        transcriptions = [item for exam in self.audit['exams'] for item in exam['transcriptions']]
        self.assertEqual(len(transcriptions), 2)
        self.assertIn(question['id'], [item['questionId'] for item in transcriptions])

    def test_cross_page_segments_do_not_overwrite_each_other(self):
        filenames = [segment['file'] for exam in self.audit['exams'] for segment in exam['segments']]
        self.assertEqual(len(filenames), len(set(filenames)))
        question = next(q for q in self.questions if q['id'] == 'intermediate-114-2-3-q47')
        self.assertNotIn('Titanic', question['options']['D'])


if __name__ == '__main__':
    unittest.main()

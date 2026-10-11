import argparse
import hashlib
import json
import re
import shutil
import subprocess
import tempfile
import unicodedata
import xml.etree.ElementTree as ET
from pathlib import Path


def exam_metadata(source):
    level, year, session, filename = source.parts
    subject_number = int(re.search(r'第(\d+)科', filename).group(1))
    year_number = int(re.search(r'\d+', year).group())
    session_number = int(re.search(r'\d+', session).group())
    prefix = 'beginner' if level == '初級' else 'intermediate'
    return {'id': f'{prefix}-{year_number}-{session_number}-{subject_number}', 'level': level, 'year': year_number, 'session': session_number, 'subject': filename.split('_')[1], 'subjectNumber': subject_number, 'source': source.as_posix(), 'questionCount': 0}


def split_options(text):
    matches = list(re.finditer(r'[（(]([ABCD])[)）]', text))
    line_starts = list(re.finditer(r'(?m)^[ \t]*[（(]([ABCD])[)）]', text))
    if {match.group(1) for match in line_starts} == set('ABCD'):
        matches = line_starts
    ordered = []
    for match in matches:
        if match.group(1) == 'ABCD'[len(ordered)]:
            ordered.append(match)
            if len(ordered) == 4:
                break
    if len(ordered) < 4:
        ordered = matches
    options = dict.fromkeys('ABCD', '')
    if not ordered:
        return text.strip(), options
    for index, match in enumerate(ordered):
        end = ordered[index + 1].start() if index + 1 < len(ordered) else len(text)
        options[match.group(1)] = text[match.end():end].strip()
    return text[:ordered[0].start()].strip(), options


def transcribe_image_options(question):
    if question['id'] == 'intermediate-114-2-3-q45':
        header = 'import torch\nimport torchvision.models as models\n\nmodel = models.vgg16(pretrained=True)\n'
        targets = {'A': 'model.parameters()', 'B': 'model.features.parameters()', 'C': 'model.classifier.parameters()'}
        for letter, target in targets.items():
            question['options'][letter] = header + f'for param in {target}:\n    param.requires_grad = False\nmodel.classifier[6] = torch.nn.Linear(4096, 10)'
        question['options']['D'] = header + 'model.requires_grad = False\nmodel.classifier[6] = torch.nn.Linear(4096, 10)'
        return {'questionId': question['id'], 'type': 'visually-verified-image-option-transcription', 'sourcePage': 14, 'sourceImage': '/assets/questions/intermediate-114-2-3-q45-p14-s2.webp'}
    if question['id'] != 'intermediate-115-1-2-q49':
        return None
    for letter in 'ABCD':
        arguments = 'X_norm, y' if letter in 'AB' else 'y, X_norm'
        solver = 'liblinear' if letter in 'AC' else 'lbfgs'
        question['options'][letter] = f'x_train, x_test, y_train, y_test = train_test_split({arguments}, train_size=0.2, random_state=123)\nlog_reg = LogisticRegression(solver="{solver}")\nlog_reg.fit(x_train, y_train)'
    return {'questionId': question['id'], 'type': 'visually-verified-image-option-transcription', 'sourcePage': 17, 'sourceImage': '/assets/questions/intermediate-115-1-2-q49-p17-s2.webp'}


def bbox_pages(source):
    result = subprocess.run(['pdftotext', '-bbox-layout', str(source), '-'], capture_output=True, text=True, check=True)
    document = ET.fromstring(result.stdout)
    return [[{'text': word.text or '', 'x0': float(word.attrib['xMin']), 'x1': float(word.attrib['xMax']), 'top': float(word.attrib['yMin']), 'bottom': float(word.attrib['yMax'])} for word in page.iter() if word.tag.endswith('word')] for page in document.iter() if page.tag.endswith('page')]


def join_words(words):
    lines = []
    for word in sorted(words, key=lambda item: ((item['top'] + item['bottom']) / 2, item['x0'])):
        center = (word['top'] + word['bottom']) / 2
        line = next((item for item in reversed(lines) if abs(item[0] - center) < 5), None)
        if line is None:
            lines.append([center, [word]])
        else:
            line[1].append(word)
    result = []
    for _, items in lines:
        items.sort(key=lambda item: item['x0'])
        text = ''
        previous = None
        for item in items:
            if previous and item['x0'] - previous['x1'] > 1.4:
                text += ' '
            text += item['text']
            previous = item
        result.append(text.strip())
    return '\n'.join(result)


def table_rows(page):
    borders = [rect for rect in page.rects if rect['width'] < 1 and rect['height'] > 8 and 30 < rect['x0'] < 565 and rect['top'] > 80]
    if not borders:
        raise ValueError(f'No table borders on page {page.page_number}')
    right = max(rect['x0'] for rect in borders)
    xvalues = sorted(set(round(rect['x0'], 1) for rect in borders if rect['top'] < 140))
    divider = xvalues[1]
    rows = sorted([rect for rect in borders if abs(rect['x0'] - right) < 1], key=lambda rect: rect['top'])
    return divider, right, rows


def extract_exam(source, root, output, render):
    import pdfplumber
    exam = exam_metadata(source.relative_to(root))
    words_by_page = bbox_pages(source)
    questions = []
    segments = []
    exceptions = []
    marker_numbers = []
    shared_groups = []
    transcriptions = []
    active_context = None
    with pdfplumber.open(source) as document:
        for page, words in zip(document.pages, words_by_page):
            divider, right, rows = table_rows(page)
            for row_index, row in enumerate(rows, 1):
                inside = [word for word in words if row['top'] <= (word['top'] + word['bottom']) / 2 < row['bottom']]
                if any(word['text'] in ('答案', '題目') for word in inside):
                    continue
                markers = [word for word in inside if divider < word['x0'] < divider + 27 and re.fullmatch(r'\d+\.', word['text'])]
                answer_words = [unicodedata.normalize('NFKC', word['text']) for word in inside if word['x1'] < divider - 1 and re.fullmatch(r'[ABCDＡＢＣＤ、,／/ ]+', word['text'])]
                content = [word for word in inside if word['x0'] > divider + 1 and word not in markers]
                text = join_words(content)
                shared = re.search(r'(?:第\s*)?(\d+)\s*[~～至-]\s*(\d+)\s*題', text) if not markers else None
                if shared:
                    active_context = {'start': int(shared[1]), 'end': int(shared[2]), 'parts': [], 'pages': [], 'images': []}
                    if questions:
                        preceding = questions[-1]
                        option_parts = [index for index, part in enumerate(preceding['_parts']) if re.search(r'[（(]D[)）]', part)]
                        if option_parts:
                            first = option_parts[-1] + 1
                            if first < len(preceding['_parts']) and preceding['pages'][first] == preceding['pages'][first - 1]:
                                active_context['parts'] = preceding['_parts'][first:]
                                active_context['pages'] = preceding['pages'][first:]
                                owner = f"{exam['id']}-context{active_context['start']}-{active_context['end']}"
                                for image_url in preceding['images'][first:]:
                                    filename = image_url.rsplit('/', 1)[-1]
                                    segment = next(item for item in segments if item['file'] == filename)
                                    segment['owner'] = owner
                                    segment['file'] = filename.replace(preceding['id'], owner)
                                    active_context['images'].append(f"/assets/questions/{segment['file']}")
                                preceding['_parts'] = preceding['_parts'][:first]
                                preceding['pages'] = preceding['pages'][:first]
                                preceding['images'] = preceding['images'][:first]
                    shared_groups.append(active_context)
                if markers:
                    active_context = None
                    number = int(markers[0]['text'][:-1])
                    marker_numbers.append(number)
                    answer = ''.join(re.findall(r'[ABCD]', ''.join(answer_words)))
                    question = {'id': f"{exam['id']}-q{number}", 'examId': exam['id'], 'number': number, 'stem': '', 'options': dict.fromkeys('ABCD', ''), 'answer': answer, 'pages': [], 'images': []}
                    questions.append(question)
                    question['_parts'] = []
                elif not questions:
                    if content:
                        exceptions.append({'page': page.page_number, 'type': 'unassigned-content', 'text': join_words(content)})
                    continue
                question = questions[-1]
                if active_context:
                    owner = f"{exam['id']}-context{active_context['start']}-{active_context['end']}"
                    active_context['parts'].append(text)
                    active_context['pages'].append(page.page_number)
                    image_list = active_context['images']
                else:
                    owner = question['id']
                    question['_parts'].append(text)
                    question['pages'].append(page.page_number)
                    image_list = question['images']
                image_name = f"{owner}-p{page.page_number}-s{row_index}.webp"
                image_list.append(f'/assets/questions/{image_name}')
                segments.append({'owner': owner, 'page': page.page_number, 'bbox': [round(divider + 1, 3), round(row['top'], 3), round(right - 0.5, 3), round(row['bottom'], 3)], 'file': image_name})
        page_count = len(document.pages)
    for question in questions:
        for group in shared_groups:
            if group['start'] <= question['number'] <= group['end']:
                question['_parts'] = group['parts'] + question['_parts']
                question['images'] = group['images'] + question['images']
                question['pages'] = group['pages'] + question['pages']
        question['pages'] = sorted(set(question['pages']))
        question['stem'], question['options'] = split_options('\n'.join(question.pop('_parts')))
        transcription = transcribe_image_options(question)
        if transcription:
            transcriptions.append(transcription)
        if not re.fullmatch(r'[ABCD]+', question['answer']):
            exceptions.append({'questionId': question['id'], 'type': 'answer-review', 'answer': question['answer']})
        for letter, text in question['options'].items():
            if not text:
                exceptions.append({'questionId': question['id'], 'type': 'option-image-or-review', 'option': letter})
    if marker_numbers != list(range(1, max(marker_numbers, default=0) + 1)):
        exceptions.append({'type': 'number-sequence', 'numbers': marker_numbers})
    exam['questionCount'] = len(questions)
    paper = output / 'public' / 'papers' / f"{exam['id']}.pdf"
    paper.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, paper)
    if render:
        render_segments(source, segments, output / 'public' / 'assets' / 'questions')
    audit = {'examId': exam['id'], 'source': exam['source'], 'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'pageCount': page_count, 'questionCount': len(questions), 'numbers': marker_numbers, 'segments': segments, 'sharedContexts': shared_groups, 'transcriptions': transcriptions, 'exceptions': exceptions}
    return exam, questions, audit


def render_segments(source, segments, target):
    from PIL import Image
    target.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as directory:
        for page_number in sorted(set(segment['page'] for segment in segments)):
            prefix = Path(directory) / 'page'
            subprocess.run(['pdftoppm', '-f', str(page_number), '-l', str(page_number), '-singlefile', '-r', '160', '-png', str(source), str(prefix)], check=True, capture_output=True)
            with Image.open(str(prefix) + '.png') as image:
                scale = 160 / 72
                for segment in [item for item in segments if item['page'] == page_number]:
                    bounds = tuple(round(value * scale) for value in segment['bbox'])
                    image.crop(bounds).save(target / segment['file'], 'WEBP', quality=90, method=6)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--no-render', action='store_true')
    args = parser.parse_args()
    output = Path(__file__).resolve().parents[1]
    root = output.parent
    exams = []
    questions = []
    audits = []
    for source in sorted([*root.glob('初級/**/*.pdf'), *root.glob('中級/**/*.pdf')]):
        exam, items, audit = extract_exam(source, root, output, not args.no_render)
        exams.append(exam)
        questions.extend(items)
        audits.append(audit)
        print(f"{exam['id']}: {len(items)} questions, {len(audit['exceptions'])} exceptions", flush=True)
    content = output / 'content'
    content.mkdir(parents=True, exist_ok=True)
    for filename, data in [('exams.json', exams), ('questions.json', questions), ('extraction-audit.json', {'method': 'Poppler bbox text + PDF table geometry; original answer-free row crops at 160 DPI', 'examCount': len(exams), 'questionCount': len(questions), 'imageCount': sum(len(question['images']) for question in questions), 'exams': audits})]:
        (content / filename).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    assert len(exams) == 14, f'Expected 14 source PDFs, got {len(exams)}'
    assert len({question['id'] for question in questions}) == len(questions)
    assert all(question['pages'] and question['stem'] for question in questions)


if __name__ == '__main__':
    main()

import ast
import sys
import json

def parse_python_file(file_path):
    with open(file_path, 'r') as file:
        tree = ast.parse(file.read())

    functions = []
    classes = []

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            functions.append({
                'name': node.name,
                'params': [arg.arg for arg in node.args.args],
                'start': node.lineno,
                'end': node.end_lineno
            })
        elif isinstance(node, ast.ClassDef):
            classes.append({
                'name': node.name,
                'start': node.lineno,
                'end': node.end_lineno
            })

    return json.dumps({'functions': functions, 'classes': classes})

if __name__ == '__main__':
    if len(sys.argv) > 1:
        print(parse_python_file(sys.argv[1]))
    else:
        print(json.dumps({'error': 'No file path provided'}))
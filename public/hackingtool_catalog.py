"""Read-only, pinned HackingTool metadata; never execute upstream code or commands."""
import hashlib
import json
from pathlib import Path
from urllib.request import urlopen

COMMIT = 'b5e8c5a5b81064ffe3d2cf59e2fdf8fa8dea09b3'
SHA256 = '93008383cefeb0c43360ba6300e922ba2ba4685df51c164f1d9bca53405095b4'
URL = f'https://raw.githubusercontent.com/MAXZL1/hackingtool-plugin/{COMMIT}/plugins/hackingtool/data/tools.json'


def catalog_path():
    return Path.home() / '.aiapp' / 'hackingtool' / 'catalog.json'


def parse_catalog(raw):
    if hashlib.sha256(raw).hexdigest() != SHA256:
        raise ValueError('Catalogue checksum mismatch; download rejected')
    data = json.loads(raw)
    # Deliberately discard all installation/run commands and executable metadata.
    return [
        {key: str(item.get(key, '')) for key in
         ('id', 'title', 'description', 'category', 'project_url')}
        for item in data['tools']
    ]


def load_catalog():
    path = catalog_path()
    if not path.is_file():
        return []
    return parse_catalog(path.read_bytes())


def download_catalog():
    with urlopen(URL, timeout=20) as response:
        raw = response.read(1_000_001)
    tools = parse_catalog(raw)
    path = catalog_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix('.tmp')
    temporary.write_bytes(raw)
    temporary.replace(path)
    return {'loaded': True, 'count': len(tools), 'commit': COMMIT, 'mode': 'read-only'}


def search_catalog(query='', category=''):
    words = query.lower().split()
    return [item for item in load_catalog()
            if (not category or item['category'] == category)
            and all(word in ' '.join(item.values()).lower() for word in words)]
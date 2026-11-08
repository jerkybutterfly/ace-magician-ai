"""Run with python3 -m unittest discover -s scripts -p 'test_hackingtool_catalog.py'."""
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('catalog', Path(__file__).resolve().parents[1] / 'public/hackingtool_catalog.py')
catalog = importlib.util.module_from_spec(spec)
spec.loader.exec_module(catalog)


class CatalogTests(unittest.TestCase):
    def setUp(self):
        self.raw = json.dumps({'tools': [{'id': 'test', 'title': 'Test scanner', 'category': 'audit',
                                         'install_commands': ['bad command'], 'run_commands': ['bad command']}]}).encode()

    def test_rejects_changed_upstream_content(self):
        with self.assertRaisesRegex(ValueError, 'checksum mismatch'):
            catalog.parse_catalog(self.raw)

    def test_never_exposes_command_fields(self):
        with patch.object(catalog, 'SHA256', hashlib.sha256(self.raw).hexdigest()):
            result = catalog.parse_catalog(self.raw)
        self.assertEqual(set(result[0]), {'id', 'title', 'description', 'category', 'project_url'})

    def test_search_reads_local_catalog_and_filters(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'catalog.json'
            path.write_bytes(self.raw)
            with patch.object(catalog, 'catalog_path', return_value=path), patch.object(catalog, 'SHA256', hashlib.sha256(self.raw).hexdigest()):
                self.assertEqual(len(catalog.search_catalog('scanner', 'audit')), 1)
                self.assertEqual(catalog.search_catalog('missing'), [])

    def test_download_checks_content_before_writing(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'catalog.json'
            with patch.object(catalog, 'catalog_path', return_value=path), patch.object(catalog, 'urlopen') as fetch:
                fetch.return_value.__enter__.return_value.read.return_value = b'untrusted'
                with self.assertRaises(ValueError):
                    catalog.download_catalog()
                self.assertFalse(path.exists())


if __name__ == '__main__':
    unittest.main()
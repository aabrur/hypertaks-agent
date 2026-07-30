#!/usr/bin/env python3
"""Unit tests for cross-host conformance validator."""

import unittest
from scripts.validate_conformance import main


class ValidateConformanceTests(unittest.TestCase):
    def test_conformance_validation_passes(self) -> None:
        rc = main()
        self.assertEqual(rc, 0)


if __name__ == "__main__":
    unittest.main()

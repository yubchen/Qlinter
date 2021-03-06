#
# linter.py
# Linter for SublimeLinter3, a code checking framework for Sublime Text 3
#
# Written by roadhump
# Copyright (c) 2014 roadhump
#
# License: MIT
#

"""This module exports the ESLint plugin class."""

import sublime
import os
import re
import sys
from .lint import NodeLinter


class ESLint(NodeLinter):

    """Provides an interface to the eslint executable."""
    cwd = os.path.split(os.path.realpath(__file__))[0]
    syntax = ('javascript', 'html', 'javascriptnext', 'javascript (babel)', 'javascript (jsx)', 'jsx-real')
    npm_name = 'eslint'
    cmd = ('node', cwd+'/eslint/bin/eslint.js', '--format', 'compact', '--stdin', '--stdin-filename', '__RELATIVE_TO_FOLDER__')
    version_args = '--version'
    version_re = r'v(?P<version>\d+\.\d+\.\d+)'
    version_requirement = '>= 0.20.0'
    regex = (
        r'^.+?: line (?P<line>\d+), col (?P<col>\d+), '
        r'(?:(?P<error>Error)|(?P<warning>Warning)) - '
        r'(?P<message>.+)'
    )
    config_fail_regex = re.compile(r'^Cannot read config file: .*\r?\n')
    crash_regex = re.compile(
        r'^(.*?)\r?\n\w*Error: \1',
        re.MULTILINE
    )
    line_col_base = (1, 0)
    selectors = {
        'html': 'source.js.embedded.html'
    }

    def find_errors(self, output):
        """
        Parses errors from linter's output

        We override this method to handle parsing eslint crashes
        """

        match = self.config_fail_regex.match(output)
        if match:
            return [(match, 0, None, "Error", "", match.group(0), None)]

        match = self.crash_regex.match(output)
        if match:
            msg = "ESLint crashed: %s" % match.group(1)
            return [(match, 0, None, "Error", "", msg, None)]

        return super().find_errors(output)

    def split_match(self, match):
        """
        Extract and return values from match.

        We override this method to silent warning by .eslintignore settings.

        """

        match, line, col, error, warning, message, near = super().split_match(match)
        if message and message == 'File ignored because of your .eslintignore file. Use --no-ignore to override.':
            return match, None, None, None, None, '', None

        return match, line, col, error, warning, message, near

    def communicate(self, cmd, code=None):
        """Run an external executable using stdin to pass code and return its output."""

        if '__RELATIVE_TO_FOLDER__' in cmd:

            relfilename = self.filename

            if int(sublime.version()) >= 3080:
                window = self.view.window()
                vars = window.extract_variables()

                if 'folder' in vars:
                    relfilename = os.path.relpath(self.filename, vars['folder'])

            cmd[cmd.index('__RELATIVE_TO_FOLDER__')] = relfilename

        elif not code:
            cmd.append(self.filename)
        sys.stderr.write(super().communicate(cmd, code));
        return super().communicate(cmd, code)

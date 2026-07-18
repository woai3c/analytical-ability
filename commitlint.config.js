export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'subject-english': ({ subject }) => [
          !subject || /^[\x20-\x7e]+$/.test(subject),
          'commit subject must be written in English',
        ],
      },
    },
  ],
  rules: {
    'type-enum': [
      2,
      'always',
      ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'release', 'style', 'test', 'wip'],
    ],
    'header-max-length': [2, 'always', 100],
    'subject-english': [2, 'always'],
  },
}

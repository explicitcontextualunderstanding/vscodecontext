import scanner from 'sonarqube-scanner';
import { env, exit } from 'process';

const token = env.SONAR_TOKEN;
if (!token) {
  console.error('Error: SONAR_TOKEN environment variable is required');
  exit(1);
}

scanner({
  serverUrl: 'https://sonarcloud.io',
  token: token,
  options: {
    'sonar.projectName': 'vscodecontext',
    'sonar.projectKey': 'explicitcontextualunderstanding_vscodecontext',
    'sonar.organization': 'explicitcontextualunderstanding',
    'sonar.sources': 'src',
    'sonar.tests': 'src',
    'sonar.sourceEncoding': 'UTF-8',
    'sonar.exclusions': '**/*.test.js,**/*.d.ts',
    'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info',
    'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
    'sonar.typescript.tsconfigPath': 'tsconfig.json'
  }
},
  () => exit()
);

# Setting up SonarQube Cloud in VSCode

## Prerequisites

1. VSCode installed
2. Access to SonarCloud account

## Steps

### 1. Install SonarLint Extension

1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X or Cmd+Shift+X)
3. Search for "SonarLint"
4. Install "SonarLint" by SonarSource

### 2. Configure SonarCloud Connection

1. Open Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
2. Type "SonarLint: Connect to SonarQube/SonarCloud"
3. Select "Connect to SonarCloud"
4. Choose your SonarCloud organization: `explicitcontextualunderstanding`

### 3. Generate SonarCloud Token (if not already done)

1. Go to [SonarCloud](https://sonarcloud.io)
2. Log in to your account
3. Go to User > My Account > Security
4. Generate a new token
5. Save the token securely

### 4. Configure Project Settings

1. Set the token as environment variable:

```bash
export SONAR_TOKEN=your_token_here
```

1. The project is already configured with SonarCloud settings in `sonar-project.js`:
   - Project Key: `explicitcontextualunderstanding_vscodecontext`
   - Organization: `explicitcontextualunderstanding`
   - Server URL: `https://sonarcloud.io`

### 5. Bind Project in VSCode

1. Open Command Palette
2. Type "SonarLint: Update binding to SonarQube/SonarCloud project"
3. Select your project from the list

## Verification

1. Open any source file in the project
2. SonarLint will automatically start analyzing the code
3. Issues will be highlighted in the editor
4. View detailed issue descriptions in the Problems panel

## Troubleshooting

- If issues are not showing up, try:
  1. Command Palette > "SonarLint: Analyze all files in this project"
  2. Check Problems panel for any connection errors
  3. Verify token is correctly set
  4. Check VSCode Output panel (View > Output) and select "SonarLint" from dropdown

## Running Analysis

- Analysis runs automatically as you code
- To manually trigger analysis:

```bash
node sonar-project.js
```

(Make sure SONAR_TOKEN environment variable is set)

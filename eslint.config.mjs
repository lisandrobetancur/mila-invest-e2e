// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            'node_modules/**',
            'reports/**',
            'playwright-report/**',
            'test-results/**',
            // Sondas de medición de semantics: paquete aparte, con su propio
            // tsconfig, que lee el árbol por selector a propósito.
            'semantics-probe/**',
            'src/screenplay/ids/ids.generated.ts',
        ],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: ['eslint.config.mjs', 'scripts/*.mjs'],
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            // El contrato de selectores es el único acople con la app: nadie
            // más puede construir uno a mano.
            'no-restricted-syntax': [
                'error',
                {
                    selector: "Literal[value=/flt-semantics-identifier/]",
                    message: 'Los selectores se construyen solo en src/screenplay/ui/selector.ts.',
                },
            ],
            '@typescript-eslint/explicit-function-return-type': [
                'error',
                { allowExpressions: true, allowTypedFunctionExpressions: true },
            ],
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        },
    },
    {
        // El único lugar donde vive el selector (y esta misma configuración,
        // que necesita nombrar el atributo para poder prohibirlo).
        files: ['src/screenplay/ui/selector.ts', 'eslint.config.mjs'],
        rules: { 'no-restricted-syntax': 'off' },
    },
    {
        // WebdriverIO devuelve elementos "encadenables": se esperan con
        // `await` como cualquier promesa, pero sus tipos no lo son, y la
        // regla no sabe distinguirlos.
        files: ['mobile/**/*.ts'],
        rules: { '@typescript-eslint/await-thenable': 'off' },
    },
    {
        files: ['test/**/*.ts'],
        rules: {
            // Los specs encadenan tareas: las promesas se esperan en attemptsTo.
            '@typescript-eslint/no-floating-promises': 'error',
        },
    },
);

/**
 * Gherkin dentro de `describe`/`it`, sin Cucumber.
 *
 * Cada palabra clave envuelve actividades en una `Task` cuyo nombre empieza
 * con ella, así el reporte HTML de Serenity/JS muestra los pasos
 * Dado/Cuando/Entonces como pasos de primer nivel del escenario.
 *
 * ```ts
 * await actorCalled('Camila').attemptsTo(
 *     Dado('que #actor inició sesión con la cuenta demo', IniciarSesion.conLaCuentaDemo()),
 *     Cuando('compra 2 acciones de ISA a mercado', ComprarInstrumento.conId('ISA-CO').cantidad(2)),
 *     Entonces('ve la orden ejecutada', Ensure.that(SemanticText.of(OrderResult.status()), equals('Ejecutada'))),
 * );
 * ```
 *
 * La convención completa está en
 * [`docs/writing-scenarios.md`](../../docs/writing-scenarios.md).
 */
import { type Activity, Task } from '@serenity-js/core';

const step =
    (keyword: string) =>
    (description: string, ...activities: Activity[]): Task =>
        Task.where(`${keyword} ${description}`, ...activities);

/** Contexto del escenario. */
export const Dado = step('Dado');

/** La acción que se está probando. */
export const Cuando = step('Cuando');

/** El resultado observable. */
export const Entonces = step('Entonces');

/** Encadena con el paso anterior. */
export const Y = step('Y');

/** Contrasta con el paso anterior. */
export const Pero = step('Pero');

/** Título de una característica, para el `describe` de cada archivo. */
export const Caracteristica = (titulo: string): string => `Característica: ${titulo}`;

/** Título de una regla, para un `describe` anidado. */
export const Regla = (titulo: string): string => `Regla: ${titulo}`;

/** Título de un escenario, con sus tags al final. */
export const Escenario = (titulo: string, ...tags: string[]): string =>
    [`Escenario: ${titulo}`, ...tags].join(' ');

/** Título de un esquema del escenario, para un `describe` anidado. */
export const EsquemaDelEscenario = (titulo: string): string =>
    `Esquema del escenario: ${titulo}`;

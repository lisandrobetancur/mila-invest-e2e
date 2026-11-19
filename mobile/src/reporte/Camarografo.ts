/**
 * Saca capturas de pantalla y las mete en el reporte de Serenity/JS.
 *
 * Es el equivalente del `Photographer` de `@serenity-js/web`, que acá no se
 * puede usar: para sacar la foto pide la ventana del navegador (`GET
 * /window`) y la sesión nativa de Appium no implementa ese comando. Este
 * toma la captura con `browser.takeScreenshot()`, que es lo que entiende el
 * driver, y la publica como artefacto de la actividad que acaba de terminar.
 *
 * | `MILA_PHOTOS` | Qué fotografía |
 * |---|---|
 * | sin definir (default) | solo las interacciones que fallan |
 * | `all` | todas, para tener el paso a paso completo |
 */
import type { Stage, StageCrewMember } from '@serenity-js/core';
import {
    ActivityRelatedArtifactGenerated,
    AsyncOperationAttempted,
    AsyncOperationCompleted,
    AsyncOperationFailed,
    type DomainEvent,
    InteractionFinished,
} from '@serenity-js/core/events';
import { CorrelationId, Description, Name, Photo, ProblemIndication } from '@serenity-js/core/model';

/** Cuándo saca fotos. */
export type Estrategia = 'fallos' | 'todas';

export class Camarografo implements StageCrewMember {
    constructor(
        private readonly estrategia: Estrategia,
        private stage?: Stage,
    ) {}

    /** Lo llama Serenity al armar el elenco. */
    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;
        return this;
    }

    /** Lo llama Serenity con cada evento del escenario. */
    notifyOf(event: DomainEvent): void {
        if (!this.stage || !(event instanceof InteractionFinished)) {
            return;
        }
        const falló = event.outcome instanceof ProblemIndication;
        if (this.estrategia === 'fallos' && !falló) {
            return;
        }
        void this.fotografiar(event, this.stage);
    }

    private async fotografiar(event: InteractionFinished, stage: Stage): Promise<void> {
        const nombre = event.details.name.value;
        const id = CorrelationId.create();

        // Serenity espera a que termine la operación antes de cerrar el
        // escenario: sin esto, la foto llegaría tarde y se perdería.
        stage.announce(
            new AsyncOperationAttempted(
                new Name('Camarografo'),
                new Description(`Sacando una captura de '${nombre}'...`),
                id,
                stage.currentTime(),
            ),
        );

        try {
            const captura = await browser.takeScreenshot();
            stage.announce(
                new ActivityRelatedArtifactGenerated(
                    event.sceneId,
                    event.activityId,
                    new Name(nombre),
                    Photo.fromBase64(captura),
                    stage.currentTime(),
                ),
            );
            stage.announce(new AsyncOperationCompleted(id, stage.currentTime()));
        } catch (error) {
            stage.announce(new AsyncOperationFailed(error as Error, id, stage.currentTime()));
        }
    }
}

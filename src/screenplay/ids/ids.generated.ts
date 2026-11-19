/**
 * GENERADO por `scripts/sync-ids.ts` desde
 * `mila-invest-app/docs/semantics-ids.md`. **No se edita a mano.**
 *
 * `npm run ids:sync` regenera, `npm run ids:check` falla si quedó viejo.
 *
 * 341 entradas.
 */

/** Ids de la feature `Shell`. */
export const ShellIds = {
    /** Raíz del shell de navegación. */
    navShellView: 'nav_shell_view',
    /** Tab Inicio. */
    navHomeTab: 'nav_home_tab',
    /** Tab Mercado. */
    navMarketTab: 'nav_market_tab',
    /** Tab Portafolio. */
    navPortfolioTab: 'nav_portfolio_tab',
    /** Tab Actividad. */
    navActivityTab: 'nav_activity_tab',
    /** Raíz de "no encontrado". */
    shellNotFoundView: 'shell_not_found_view',
    /** Título de "no encontrado". */
    shellNotFoundTitleText: 'shell_not_found_title_text',
    /** "Ir al inicio" desde "no encontrado". */
    shellNotFoundHomeButton: 'shell_not_found_home_button',
} as const;

/** Ids de la feature `app_cross`. */
export const AppCrossIds = {
    /** Raíz del splash. */
    splashView: 'splash_view',
    /** Splash arrancando. */
    splashStateLoading: 'splash_state_loading',
    /** Splash con error de arranque. */
    splashStateError: 'splash_state_error',
    /** Mensaje de error del splash. */
    splashErrorText: 'splash_error_text',
    /** "Reintentar" del splash. */
    splashRetryButton: 'splash_retry_button',
    /** Raíz del onboarding. */
    onboardingView: 'onboarding_view',
    /** Título del paso visible. */
    onboardingStepTitleText: 'onboarding_step_title_text',
    /** Texto del paso visible. */
    onboardingStepBodyText: 'onboarding_step_body_text',
    /** Indicador "Paso 2 de 3". */
    onboardingProgressText: 'onboarding_progress_text',
    /** Aviso de simulación del onboarding. */
    onboardingDisclaimerText: 'onboarding_disclaimer_text',
    /** Botón "Saltar". */
    onboardingSkipButton: 'onboarding_skip_button',
    /** Botón "Siguiente". */
    onboardingNextButton: 'onboarding_next_button',
    /** Botón "Empezar" del último paso. */
    onboardingStartButton: 'onboarding_start_button',
    /** Raíz de ajustes. */
    settingsView: 'settings_view',
    /** Volver desde ajustes. */
    settingsBackIconButton: 'settings_back_icon_button',
    /** Badge "Simulado" de ajustes. */
    settingsSimulatedText: 'settings_simulated_text',
    /** Selector de tema. */
    settingsThemeMenu: 'settings_theme_menu',
    /** Tema del sistema. */
    settingsThemeSystemSegment: 'settings_theme_system_segment',
    /** Tema claro. */
    settingsThemeLightSegment: 'settings_theme_light_segment',
    /** Tema oscuro. */
    settingsThemeDarkSegment: 'settings_theme_dark_segment',
    /** Selector de idioma. */
    settingsLanguageMenu: 'settings_language_menu',
    /** Idioma español. */
    settingsLanguageEsSegment: 'settings_language_es_segment',
    /** Idioma inglés. */
    settingsLanguageEnSegment: 'settings_language_en_segment',
    /** Nombre del titular de la cuenta. */
    settingsAccountNameText: 'settings_account_name_text',
    /** Email de la cuenta. */
    settingsAccountEmailText: 'settings_account_email_text',
    /** País de la cuenta. */
    settingsAccountCountryText: 'settings_account_country_text',
    /** Documento enmascarado. */
    settingsAccountDocumentText: 'settings_account_document_text',
    /** Botón "Cerrar sesión". */
    settingsLogoutButton: 'settings_logout_button',
    /** Diálogo de confirmación de cierre de sesión. */
    settingsLogoutDialog: 'settings_logout_dialog',
    /** Confirmar el cierre de sesión. */
    settingsLogoutConfirmButton: 'settings_logout_confirm_button',
    /** Cancelar el cierre de sesión. */
    settingsLogoutCancelButton: 'settings_logout_cancel_button',
    /** Versión de la app. */
    settingsVersionText: 'settings_version_text',
    /** Modo de API activo (solo fuera de release). */
    settingsApiModeText: 'settings_api_mode_text',
    /** Aviso de simulación de ajustes. */
    settingsDisclaimerText: 'settings_disclaimer_text',
} as const;

/** Ids de la feature `authentication`. */
export const AuthIds = {
    /** Raíz de la vista de login. */
    loginView: 'auth_login_view',
    /** Badge "Simulado" del login. */
    loginSimulatedText: 'auth_login_simulated_text',
    /** Campo de email del login. */
    loginEmailField: 'auth_login_email_field',
    /** Campo de contraseña del login. */
    loginPasswordField: 'auth_login_password_field',
    /** Mostrar/ocultar la contraseña del login. */
    loginPasswordToggle: 'auth_login_password_toggle',
    /** Botón "Iniciar sesión". */
    loginSubmitButton: 'auth_login_submit_button',
    /** Botón "Usar cuenta demo" (solo en modo fake). */
    loginDemoButton: 'auth_login_demo_button',
    /** Link "Crear cuenta". */
    loginRegisterLink: 'auth_login_register_link',
    /** Mensaje de error general del login. */
    loginErrorText: 'auth_login_error_text',
    /** Aviso de simulación del login. */
    loginDisclaimerText: 'auth_login_disclaimer_text',
    /** Raíz de la vista de registro. */
    registerView: 'auth_register_view',
    /** Volver desde el registro. */
    registerBackIconButton: 'auth_register_back_icon_button',
    /** Badge "Simulado" del registro. */
    registerSimulatedText: 'auth_register_simulated_text',
    /** Chip de país Colombia. */
    registerCountryCoChip: 'auth_register_country_co_chip',
    /** Chip de país México. */
    registerCountryMxChip: 'auth_register_country_mx_chip',
    /** Chip de país Perú. */
    registerCountryPeChip: 'auth_register_country_pe_chip',
    /** Mensaje de error del país (ninguno elegido). */
    registerCountryErrorText: 'auth_register_country_error_text',
    /** Campo de nombre completo. */
    registerNameField: 'auth_register_name_field',
    /** Campo de email del registro. */
    registerEmailField: 'auth_register_email_field',
    /** Chip de tipo de documento CC. */
    registerDocumentCcChip: 'auth_register_document_cc_chip',
    /** Chip de tipo de documento CE. */
    registerDocumentCeChip: 'auth_register_document_ce_chip',
    /** Chip de tipo de documento CURP. */
    registerDocumentCurpChip: 'auth_register_document_curp_chip',
    /** Chip de tipo de documento DNI. */
    registerDocumentDniChip: 'auth_register_document_dni_chip',
    /** Campo de número de documento. */
    registerDocumentField: 'auth_register_document_field',
    /** Campo de contraseña del registro. */
    registerPasswordField: 'auth_register_password_field',
    /** Mostrar/ocultar la contraseña del registro. */
    registerPasswordToggle: 'auth_register_password_toggle',
    /** Requisito de contraseña: largo mínimo. */
    registerRequirementLengthText: 'auth_register_requirement_length_text',
    /** Requisito de contraseña: al menos una letra. */
    registerRequirementLetterText: 'auth_register_requirement_letter_text',
    /** Requisito de contraseña: al menos un número. */
    registerRequirementNumberText: 'auth_register_requirement_number_text',
    /** Aviso de simulación del registro. */
    registerDisclaimerText: 'auth_register_disclaimer_text',
    /** Checkbox de aceptación del aviso de simulación. */
    registerAcceptCheckbox: 'auth_register_accept_checkbox',
    /** Mensaje de error del checkbox de aceptación. */
    registerAcceptCheckboxErrorText: 'auth_register_accept_checkbox_error_text',
    /** Botón "Crear cuenta". */
    registerSubmitButton: 'auth_register_submit_button',
    /** Link "Ya tengo cuenta". */
    registerLoginLink: 'auth_register_login_link',
    /** Mensaje de error general del registro. */
    registerErrorText: 'auth_register_error_text',
} as const;

/** Ids de la feature `dashboard`. */
export const DashboardIds = {
    /** Raíz del inicio. */
    homeView: 'dashboard_home_view',
    /** Inicio cargando. */
    homeStateLoading: 'dashboard_home_state_loading',
    /** Inicio con datos. */
    homeStateData: 'dashboard_home_state_data',
    /** Usuario nuevo: sin saldo ni inversiones. */
    homeStateEmpty: 'dashboard_home_state_empty',
    /** Inicio con error. */
    homeStateError: 'dashboard_home_state_error',
    /** Saludo. */
    homeGreetingText: 'dashboard_home_greeting_text',
    /** Badge "Simulado". */
    homeSimulatedText: 'dashboard_home_simulated_text',
    /** Abrir la billetera. */
    homeWalletIconButton: 'dashboard_home_wallet_icon_button',
    /** Abrir ajustes. */
    homeSettingsIconButton: 'dashboard_home_settings_icon_button',
    /** Tarjeta del valor total. */
    homeTotalTile: 'dashboard_home_total_tile',
    /** Valor total. */
    homeTotalText: 'dashboard_home_total_text',
    /** Variación del día. */
    homeDayChangeText: 'dashboard_home_day_change_text',
    /** Distribución compacta. */
    homeAllocationChart: 'dashboard_home_allocation_chart',
    /** Título de los que más suben. */
    homeGainersTitleText: 'dashboard_home_gainers_title_text',
    /** Título de los que más bajan. */
    homeLosersTitleText: 'dashboard_home_losers_title_text',
    /** Título de las últimas transacciones. */
    homeRecentTitleText: 'dashboard_home_recent_title_text',
    /** "Ver todo" de las últimas transacciones. */
    homeRecentAllButton: 'dashboard_home_recent_all_button',
    /** Título de la tarjeta "Haz tu primer depósito". */
    homeEmptyTitleText: 'dashboard_home_empty_title_text',
    /** "Depositar" del usuario nuevo. */
    homeEmptyDepositButton: 'dashboard_home_empty_deposit_button',
    /** Mensaje de error. */
    homeErrorText: 'dashboard_home_error_text',
    /** "Reintentar". */
    homeRetryButton: 'dashboard_home_retry_button',
    /** Instrumento [instrumentId] entre los que más suben o bajan. */
    moverItem: (instrumentId: string): string =>
        `dashboard_mover_item_${instrumentId}`,
    /** Transacción reciente [transactionId]. */
    recentItem: (transactionId: string): string =>
        `dashboard_recent_item_${transactionId}`,
    /** Porción de la distribución de tipo [type]. */
    allocationItem: (type: string): string =>
        `dashboard_allocation_item_${type}`,
} as const;

/** Ids de la feature `market`. */
export const MarketIds = {
    /** Raíz de la lista. */
    listView: 'market_list_view',
    /** Lista cargando. */
    listStateLoading: 'market_list_state_loading',
    /** Lista con datos. */
    listStateData: 'market_list_state_data',
    /** Lista sin resultados. */
    listStateEmpty: 'market_list_state_empty',
    /** Lista con error. */
    listStateError: 'market_list_state_error',
    /** Badge "Simulado" de la lista. */
    listSimulatedText: 'market_list_simulated_text',
    /** Buscador. */
    listSearchField: 'market_list_search_field',
    /** Limpiar el buscador. */
    listSearchClearIconButton: 'market_list_search_clear_icon_button',
    /** Chip de país: todos. */
    listCountryAllChip: 'market_list_country_all_chip',
    /** Chip de país: Colombia. */
    listCountryCoChip: 'market_list_country_co_chip',
    /** Chip de país: México. */
    listCountryMxChip: 'market_list_country_mx_chip',
    /** Chip de país: Perú. */
    listCountryPeChip: 'market_list_country_pe_chip',
    /** Chip de tipo: acciones. */
    listTypeStockChip: 'market_list_type_stock_chip',
    /** Chip de tipo: ETFs. */
    listTypeEtfChip: 'market_list_type_etf_chip',
    /** Estado del mercado de Colombia. */
    listStatusCoText: 'market_list_status_co_text',
    /** Estado del mercado de México. */
    listStatusMxText: 'market_list_status_mx_text',
    /** Estado del mercado de Perú. */
    listStatusPeText: 'market_list_status_pe_text',
    /** Indicador de la página siguiente cargando. */
    listLoadingMoreText: 'market_list_loading_more_text',
    /** Error al cargar la página siguiente. */
    listLoadMoreErrorText: 'market_list_load_more_error_text',
    /** Reintentar la página siguiente. */
    listLoadMoreRetryButton: 'market_list_load_more_retry_button',
    /** Título del estado vacío. */
    listEmptyTitleText: 'market_list_empty_title_text',
    /** "Limpiar filtros". */
    listClearFiltersButton: 'market_list_clear_filters_button',
    /** Mensaje de error de la lista. */
    listErrorText: 'market_list_error_text',
    /** "Reintentar" de la lista. */
    listRetryButton: 'market_list_retry_button',
    /** Raíz del detalle. */
    detailView: 'market_detail_view',
    /** Detalle cargando. */
    detailStateLoading: 'market_detail_state_loading',
    /** Detalle con datos. */
    detailStateData: 'market_detail_state_data',
    /** Instrumento no encontrado. */
    detailStateEmpty: 'market_detail_state_empty',
    /** Detalle con error. */
    detailStateError: 'market_detail_state_error',
    /** Volver desde el detalle. */
    detailBackIconButton: 'market_detail_back_icon_button',
    /** Badge "Simulado" del detalle. */
    detailSimulatedText: 'market_detail_simulated_text',
    /** Ticker. */
    detailTickerText: 'market_detail_ticker_text',
    /** Nombre del emisor. */
    detailNameText: 'market_detail_name_text',
    /** País del instrumento. */
    detailCountryText: 'market_detail_country_text',
    /** Último precio. */
    detailPriceText: 'market_detail_price_text',
    /** Variación del día. */
    detailChangeText: 'market_detail_change_text',
    /** Estado del mercado del instrumento. */
    detailStatusText: 'market_detail_status_text',
    /** Raíz del gráfico de precios. */
    detailChart: 'market_detail_chart',
    /** Error del gráfico. */
    detailChartErrorText: 'market_detail_chart_error_text',
    /** Selector de rango del gráfico. */
    detailRangeMenu: 'market_detail_range_menu',
    /** Rango 1D. */
    detailRange1dSegment: 'market_detail_range_1d_segment',
    /** Rango 1S. */
    detailRange1wSegment: 'market_detail_range_1w_segment',
    /** Rango 1M. */
    detailRange1mSegment: 'market_detail_range_1m_segment',
    /** Rango 3M. */
    detailRange3mSegment: 'market_detail_range_3m_segment',
    /** Rango 1A. */
    detailRange1ySegment: 'market_detail_range_1y_segment',
    /** Apertura. */
    detailOpenText: 'market_detail_open_text',
    /** Máximo del día. */
    detailHighText: 'market_detail_high_text',
    /** Mínimo del día. */
    detailLowText: 'market_detail_low_text',
    /** Cierre anterior. */
    detailPrevCloseText: 'market_detail_prev_close_text',
    /** Volumen. */
    detailVolumeText: 'market_detail_volume_text',
    /** Descripción del emisor. */
    detailDescriptionText: 'market_detail_description_text',
    /** Cantidad en posición. */
    detailPositionQuantityText: 'market_detail_position_quantity_text',
    /** Valor de mercado de la posición. */
    detailPositionValueText: 'market_detail_position_value_text',
    /** P&L no realizado de la posición. */
    detailPositionPnlText: 'market_detail_position_pnl_text',
    /** Botón "Comprar". */
    detailBuyButton: 'market_detail_buy_button',
    /** Botón "Vender". */
    detailSellButton: 'market_detail_sell_button',
    /** Motivo por el que no se puede operar (mercado cerrado). */
    detailClosedReasonText: 'market_detail_closed_reason_text',
    /** Título del estado "no encontrado". */
    detailNotFoundTitleText: 'market_detail_not_found_title_text',
    /** Volver al mercado desde "no encontrado". */
    detailBackToMarketButton: 'market_detail_back_to_market_button',
    /** Mensaje de error del detalle. */
    detailErrorText: 'market_detail_error_text',
    /** "Reintentar" del detalle. */
    detailRetryButton: 'market_detail_retry_button',
    /** Ítem de la lista para el instrumento [instrumentId]. */
    listInstrumentItem: (instrumentId: string): string =>
        `market_list_instrument_item_${instrumentId}`,
} as const;

/** Ids de la feature `orders`. */
export const OrdersIds = {
    /** Raíz del ticket. */
    ticketView: 'orders_ticket_view',
    /** Ticket cargando el instrumento. */
    ticketStateLoading: 'orders_ticket_state_loading',
    /** Ticket listo para editar. */
    ticketStateData: 'orders_ticket_state_data',
    /** Instrumento no encontrado. */
    ticketStateEmpty: 'orders_ticket_state_empty',
    /** Ticket con error de carga. */
    ticketStateError: 'orders_ticket_state_error',
    /** Cerrar el ticket. */
    ticketCloseIconButton: 'orders_ticket_close_icon_button',
    /** Badge "Simulado" del ticket. */
    ticketSimulatedText: 'orders_ticket_simulated_text',
    /** Ticker y nombre del instrumento. */
    ticketInstrumentText: 'orders_ticket_instrument_text',
    /** Último precio del instrumento. */
    ticketPriceText: 'orders_ticket_price_text',
    /** Selector de lado. */
    ticketSideMenu: 'orders_ticket_side_menu',
    /** Lado comprar. */
    ticketSideBuySegment: 'orders_ticket_side_buy_segment',
    /** Lado vender. */
    ticketSideSellSegment: 'orders_ticket_side_sell_segment',
    /** Campo de cantidad. */
    ticketQuantityField: 'orders_ticket_quantity_field',
    /** Restar una unidad. */
    ticketQuantityDecreaseStepper: 'orders_ticket_quantity_decrease_stepper',
    /** Sumar una unidad. */
    ticketQuantityIncreaseStepper: 'orders_ticket_quantity_increase_stepper',
    /** Saldo disponible en la moneda del instrumento. */
    ticketAvailableText: 'orders_ticket_available_text',
    /** Cantidad en posición. */
    ticketPositionText: 'orders_ticket_position_text',
    /** Preview calculándose. */
    ticketPreviewLoadingText: 'orders_ticket_preview_loading_text',
    /** Error del preview. */
    ticketPreviewErrorText: 'orders_ticket_preview_error_text',
    /** Aviso de saldo bajo después de la orden. */
    ticketLowBalanceText: 'orders_ticket_low_balance_text',
    /** "Depositar", cuando no alcanza el saldo. */
    ticketDepositButton: 'orders_ticket_deposit_button',
    /** Motivo por el que no se puede operar (mercado cerrado). */
    ticketClosedReasonText: 'orders_ticket_closed_reason_text',
    /** "Revisar orden". */
    ticketReviewButton: 'orders_ticket_review_button',
    /** Título del estado "no encontrado". */
    ticketNotFoundTitleText: 'orders_ticket_not_found_title_text',
    /** "Cerrar" desde "no encontrado". */
    ticketNotFoundCloseButton: 'orders_ticket_not_found_close_button',
    /** Mensaje de error de carga. */
    ticketErrorText: 'orders_ticket_error_text',
    /** "Reintentar" la carga. */
    ticketRetryButton: 'orders_ticket_retry_button',
    /** Raíz del resumen de la orden. */
    summaryPanel: 'orders_summary_panel',
    /** Precio estimado o de ejecución. */
    summaryPriceText: 'orders_summary_price_text',
    /** Monto bruto. */
    summaryGrossText: 'orders_summary_gross_text',
    /** Comisión. */
    summaryCommissionText: 'orders_summary_commission_text',
    /** Total. */
    summaryTotalText: 'orders_summary_total_text',
    /** Saldo resultante. */
    summaryAvailableAfterText: 'orders_summary_available_after_text',
    /** Raíz de la confirmación. */
    confirmView: 'orders_confirm_view',
    /** Volver de la confirmación al ticket. */
    confirmBackIconButton: 'orders_confirm_back_icon_button',
    /** Lado y cantidad que se confirman. */
    confirmOrderText: 'orders_confirm_order_text',
    /** Aviso de simulación de la confirmación. */
    confirmDisclaimerText: 'orders_confirm_disclaimer_text',
    /** "Confirmar compra" / "Confirmar venta". */
    confirmSubmitButton: 'orders_confirm_submit_button',
    /** Error al enviar la orden. */
    confirmErrorText: 'orders_confirm_error_text',
    /** Raíz del resultado. */
    resultView: 'orders_result_view',
    /** Estado de la orden (ejecutada, rechazada, pendiente, cancelada). */
    resultStatusText: 'orders_result_status_text',
    /** Diferencia entre el precio estimado y el de ejecución. */
    resultPriceDifferenceText: 'orders_result_price_difference_text',
    /** Motivo del rechazo. */
    resultRejectReasonText: 'orders_result_reject_reason_text',
    /** "Ver portafolio". */
    resultPortfolioButton: 'orders_result_portfolio_button',
    /** Acción sugerida tras un rechazo (por ejemplo, "Depositar"). */
    resultSuggestedActionButton: 'orders_result_suggested_action_button',
    /** "Listo": cierra el ticket. */
    resultDoneButton: 'orders_result_done_button',
    /** Raíz del historial. */
    historyView: 'orders_history_view',
    /** Historial cargando. */
    historyStateLoading: 'orders_history_state_loading',
    /** Historial con órdenes. */
    historyStateData: 'orders_history_state_data',
    /** Historial vacío. */
    historyStateEmpty: 'orders_history_state_empty',
    /** Historial con error. */
    historyStateError: 'orders_history_state_error',
    /** Selector de sección de la tab Actividad. */
    historySectionMenu: 'orders_history_section_menu',
    /** Sección "Movimientos" del selector de Actividad. */
    historyMovementsTab: 'orders_history_movements_tab',
    /** Sección "Órdenes" del selector de Actividad. */
    historyOrdersTab: 'orders_history_orders_tab',
    /** Filtro: todas. */
    historyStatusAllChip: 'orders_history_status_all_chip',
    /** Filtro: pendientes. */
    historyStatusPendingChip: 'orders_history_status_pending_chip',
    /** Filtro: ejecutadas. */
    historyStatusFilledChip: 'orders_history_status_filled_chip',
    /** Filtro: rechazadas. */
    historyStatusRejectedChip: 'orders_history_status_rejected_chip',
    /** Filtro: canceladas. */
    historyStatusCancelledChip: 'orders_history_status_cancelled_chip',
    /** Página siguiente cargando. */
    historyLoadingMoreText: 'orders_history_loading_more_text',
    /** Error al cargar la página siguiente. */
    historyLoadMoreErrorText: 'orders_history_load_more_error_text',
    /** Reintentar la página siguiente. */
    historyLoadMoreRetryButton: 'orders_history_load_more_retry_button',
    /** Título del estado vacío. */
    historyEmptyTitleText: 'orders_history_empty_title_text',
    /** "Explorar mercado" del estado vacío. */
    historyExploreButton: 'orders_history_explore_button',
    /** Mensaje de error. */
    historyErrorText: 'orders_history_error_text',
    /** "Reintentar". */
    historyRetryButton: 'orders_history_retry_button',
    /** Raíz del detalle de orden. */
    detailView: 'orders_detail_view',
    /** Detalle cargando. */
    detailStateLoading: 'orders_detail_state_loading',
    /** Detalle con datos. */
    detailStateData: 'orders_detail_state_data',
    /** Orden no encontrada. */
    detailStateEmpty: 'orders_detail_state_empty',
    /** Detalle con error. */
    detailStateError: 'orders_detail_state_error',
    /** Volver desde el detalle. */
    detailBackIconButton: 'orders_detail_back_icon_button',
    /** Estado de la orden. */
    detailStatusText: 'orders_detail_status_text',
    /** Instrumento de la orden. */
    detailInstrumentText: 'orders_detail_instrument_text',
    /** Lado de la orden. */
    detailSideText: 'orders_detail_side_text',
    /** Cantidad de la orden. */
    detailQuantityText: 'orders_detail_quantity_text',
    /** Fecha de creación. */
    detailCreatedText: 'orders_detail_created_text',
    /** Fecha de ejecución. */
    detailFilledText: 'orders_detail_filled_text',
    /** Motivo del rechazo. */
    detailRejectReasonText: 'orders_detail_reject_reason_text',
    /** Ver el instrumento de la orden. */
    detailInstrumentButton: 'orders_detail_instrument_button',
    /** Título del estado "no encontrada". */
    detailNotFoundTitleText: 'orders_detail_not_found_title_text',
    /** Volver al historial desde "no encontrada". */
    detailBackToHistoryButton: 'orders_detail_back_to_history_button',
    /** Mensaje de error del detalle. */
    detailErrorText: 'orders_detail_error_text',
    /** "Reintentar" del detalle. */
    detailRetryButton: 'orders_detail_retry_button',
    /** Ítem del historial para la orden [orderId]. */
    historyItem: (orderId: string): string =>
        `orders_history_item_${orderId}`,
} as const;

/** Ids de la feature `wallet`. */
export const WalletIds = {
    /** Raíz de la billetera. */
    accountsView: 'wallet_accounts_view',
    /** Billetera cargando. */
    accountsStateLoading: 'wallet_accounts_state_loading',
    /** Billetera con saldo. */
    accountsStateData: 'wallet_accounts_state_data',
    /** Billetera sin saldo. */
    accountsStateEmpty: 'wallet_accounts_state_empty',
    /** Billetera con error. */
    accountsStateError: 'wallet_accounts_state_error',
    /** Volver desde la billetera. */
    accountsBackIconButton: 'wallet_accounts_back_icon_button',
    /** Badge "Simulado" de la billetera. */
    accountsSimulatedText: 'wallet_accounts_simulated_text',
    /** Título del estado vacío. */
    accountsEmptyTitleText: 'wallet_accounts_empty_title_text',
    /** "Hacer un depósito" del estado vacío. */
    accountsEmptyDepositButton: 'wallet_accounts_empty_deposit_button',
    /** Mensaje de error de la billetera. */
    accountsErrorText: 'wallet_accounts_error_text',
    /** "Reintentar" de la billetera. */
    accountsRetryButton: 'wallet_accounts_retry_button',
    /** Disponible en COP. */
    copAvailableText: 'wallet_cop_available_text',
    /** Reservado en COP. */
    copReservedText: 'wallet_cop_reserved_text',
    /** Depositar en COP. */
    copDepositButton: 'wallet_cop_deposit_button',
    /** Disponible en MXN. */
    mxnAvailableText: 'wallet_mxn_available_text',
    /** Reservado en MXN. */
    mxnReservedText: 'wallet_mxn_reserved_text',
    /** Depositar en MXN. */
    mxnDepositButton: 'wallet_mxn_deposit_button',
    /** Disponible en PEN. */
    penAvailableText: 'wallet_pen_available_text',
    /** Reservado en PEN. */
    penReservedText: 'wallet_pen_reserved_text',
    /** Depositar en PEN. */
    penDepositButton: 'wallet_pen_deposit_button',
    /** Raíz del depósito. */
    depositView: 'wallet_deposit_view',
    /** Cerrar el depósito. */
    depositCloseIconButton: 'wallet_deposit_close_icon_button',
    /** Selector de moneda. */
    depositCurrencyMenu: 'wallet_deposit_currency_menu',
    /** Moneda COP. */
    depositCurrencyCopSegment: 'wallet_deposit_currency_cop_segment',
    /** Moneda MXN. */
    depositCurrencyMxnSegment: 'wallet_deposit_currency_mxn_segment',
    /** Moneda PEN. */
    depositCurrencyPenSegment: 'wallet_deposit_currency_pen_segment',
    /** Campo del monto. */
    depositAmountField: 'wallet_deposit_amount_field',
    /** Saldo disponible en la moneda elegida. */
    depositAvailableText: 'wallet_deposit_available_text',
    /** Aviso de simulación del depósito. */
    depositDisclaimerText: 'wallet_deposit_disclaimer_text',
    /** Botón "Depositar". */
    depositSubmitButton: 'wallet_deposit_submit_button',
    /** Mensaje de error del depósito. */
    depositErrorText: 'wallet_deposit_error_text',
    /** Snackbar de depósito realizado. */
    depositSuccessSnackbar: 'wallet_deposit_success_snackbar',
    /** Tarjeta de la cuenta en [currencyCode] (`COP`, `MXN`, `PEN`). */
    accountItem: (currencyCode: string): string =>
        `wallet_account_item_${currencyCode}`,
    /** Monto sugerido [amount] (string decimal de la API). */
    depositSuggestedItem: (amount: string): string =>
        `wallet_deposit_suggested_item_${amount}`,
} as const;

/** Ids de la feature `portfolio`. */
export const PortfolioIds = {
    /** Raíz del portafolio. */
    overviewView: 'portfolio_overview_view',
    /** Portafolio cargando. */
    overviewStateLoading: 'portfolio_overview_state_loading',
    /** Portafolio con datos. */
    overviewStateData: 'portfolio_overview_state_data',
    /** Portafolio sin inversiones. */
    overviewStateEmpty: 'portfolio_overview_state_empty',
    /** Portafolio con error. */
    overviewStateError: 'portfolio_overview_state_error',
    /** Badge "Simulado". */
    overviewSimulatedText: 'portfolio_overview_simulated_text',
    /** Tarjeta del valor total. */
    overviewTotalTile: 'portfolio_overview_total_tile',
    /** Valor total en moneda base. */
    overviewTotalText: 'portfolio_overview_total_text',
    /** Variación del día. */
    overviewDayChangeText: 'portfolio_overview_day_change_text',
    /** Efectivo. */
    overviewCashText: 'portfolio_overview_cash_text',
    /** Invertido. */
    overviewInvestedText: 'portfolio_overview_invested_text',
    /** Gráfico de distribución. */
    overviewAllocationChart: 'portfolio_overview_allocation_chart',
    /** Nota de los tipos de cambio usados. */
    overviewFxText: 'portfolio_overview_fx_text',
    /** Título del estado vacío. */
    overviewEmptyTitleText: 'portfolio_overview_empty_title_text',
    /** "Explorar mercado". */
    overviewExploreButton: 'portfolio_overview_explore_button',
    /** Mensaje de error. */
    overviewErrorText: 'portfolio_overview_error_text',
    /** "Reintentar". */
    overviewRetryButton: 'portfolio_overview_retry_button',
    /** Posición en el instrumento [instrumentId]. */
    positionItem: (instrumentId: string): string =>
        `portfolio_position_item_${instrumentId}`,
    /** Porción de la distribución de tipo [type] (`STOCK`, `ETF`, `CASH`). */
    allocationItem: (type: string): string =>
        `portfolio_allocation_item_${type}`,
} as const;

/** Ids de la feature `transactions`. */
export const TransactionsIds = {
    /** Raíz de la lista de movimientos. */
    listView: 'transactions_list_view',
    /** Movimientos cargando. */
    listStateLoading: 'transactions_list_state_loading',
    /** Movimientos con datos. */
    listStateData: 'transactions_list_state_data',
    /** Sin movimientos. */
    listStateEmpty: 'transactions_list_state_empty',
    /** Movimientos con error. */
    listStateError: 'transactions_list_state_error',
    /** Badge "Simulado". */
    listSimulatedText: 'transactions_list_simulated_text',
    /** Selector de sección de la tab Actividad. */
    listSectionMenu: 'transactions_list_section_menu',
    /** Sección "Movimientos" del selector de Actividad. */
    listMovementsTab: 'transactions_list_movements_tab',
    /** Sección "Órdenes" del selector de Actividad. */
    listOrdersTab: 'transactions_list_orders_tab',
    /** Filtro de tipo: todos. */
    listTypeAllChip: 'transactions_list_type_all_chip',
    /** Filtro de tipo: depósitos. */
    listTypeDepositChip: 'transactions_list_type_deposit_chip',
    /** Filtro de tipo: compras. */
    listTypeBuyChip: 'transactions_list_type_buy_chip',
    /** Filtro de tipo: ventas. */
    listTypeSellChip: 'transactions_list_type_sell_chip',
    /** Filtro de tipo: comisiones. */
    listTypeFeeChip: 'transactions_list_type_fee_chip',
    /** Rango: todo. */
    listRangeAllChip: 'transactions_list_range_all_chip',
    /** Rango: últimos 7 días. */
    listRange7dChip: 'transactions_list_range_7d_chip',
    /** Rango: últimos 30 días. */
    listRange30dChip: 'transactions_list_range_30d_chip',
    /** Rango: últimos 90 días. */
    listRange90dChip: 'transactions_list_range_90d_chip',
    /** Página siguiente cargando. */
    listLoadingMoreText: 'transactions_list_loading_more_text',
    /** Error de la página siguiente. */
    listLoadMoreErrorText: 'transactions_list_load_more_error_text',
    /** Reintentar la página siguiente. */
    listLoadMoreRetryButton: 'transactions_list_load_more_retry_button',
    /** Título del estado vacío. */
    listEmptyTitleText: 'transactions_list_empty_title_text',
    /** "Depositar" del estado vacío. */
    listEmptyDepositButton: 'transactions_list_empty_deposit_button',
    /** "Limpiar filtros" del estado vacío con filtros. */
    listClearFiltersButton: 'transactions_list_clear_filters_button',
    /** Mensaje de error. */
    listErrorText: 'transactions_list_error_text',
    /** "Reintentar". */
    listRetryButton: 'transactions_list_retry_button',
    /** Encabezado del día [isoDate] (`2026-11-18`). */
    dayItem: (isoDate: string): string =>
        `transactions_day_item_${isoDate}`,
    /** Movimiento [transactionId]. */
    listItem: (transactionId: string): string =>
        `transactions_list_item_${transactionId}`,
} as const;

/**
 * Ids que los componentes derivan del id de su raíz. El argumento es el id
 * de la raíz, no el de la feature.
 */
export const DerivedIds = {
    /** AppTextField: `<id de la raíz>_error_text`. */
    errorTextOf: (rootId: string): string => `${rootId}_error_text`,
    /** InstrumentTile: `<id de la raíz>_price_text`. */
    priceTextOf: (rootId: string): string => `${rootId}_price_text`,
    /** InstrumentTile: `<id de la raíz>_change_text`. */
    changeTextOf: (rootId: string): string => `${rootId}_change_text`,
    /** InstrumentTile: `<id de la raíz>_country_text`. */
    countryTextOf: (rootId: string): string => `${rootId}_country_text`,
    /** Monto de un movimiento. */
    amountTextOf: (rootId: string): string => `${rootId}_amount_text`,
    /** Estado de un ítem del historial. */
    statusTextOf: (rootId: string): string => `${rootId}_status_text`,
    /** Total de un ítem del historial. */
    totalTextOf: (rootId: string): string => `${rootId}_total_text`,
    /** Cantidad de una posición. */
    quantityTextOf: (rootId: string): string => `${rootId}_quantity_text`,
    /** Costo promedio de una posición. */
    avgCostTextOf: (rootId: string): string => `${rootId}_avg_cost_text`,
    /** Valor de mercado de una posición. */
    valueTextOf: (rootId: string): string => `${rootId}_value_text`,
    /** P&L no realizado de una posición. */
    pnlTextOf: (rootId: string): string => `${rootId}_pnl_text`,
    /** Descripción de un movimiento. */
    descriptionTextOf: (rootId: string): string => `${rootId}_description_text`,
} as const;

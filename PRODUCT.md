# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Liliana Cesarios ("Lili"), owner/operator of Vaires Medical — División Alimentos, a food distributor delivering to clinics and hospitals in Buenos Aires province (based in Luján). She is the sole day-to-day user: non-technical, handles physical deliveries, inventory counts, and the paperwork that goes with them. Ivan is the developer building the app for her; he is not a day-to-day user of the shipped product.

## Product Purpose

Replace paper/manual tracking of food inventory, clinic deliveries, and remito paperwork with a structured local desktop app. It tracks stock per batch/lot with expiration dates (consumed FIFO), manages clinic customer records, and generates/prints delivery remitos compliant with Argentine fiscal CAI numbering. Success means fewer of the errors manual tracking caused: expired stock going unnoticed, and remito numbers reused or misrecorded.

## Positioning

Purpose-built for one small food distributor selling into clinics/hospitals, combining lot/expiration-aware inventory with Argentina-specific fiscal remito compliance (CAI-authorized numbering, printable letterhead) in a single local tool — not a generic inventory SaaS, and not the loose paper/spreadsheet process it replaces.

## Operating Context

Runs as a local Tauri desktop app (Windows), single location (Luján, Provincia de Buenos Aires), single active user day-to-day, data stored locally in SQLite. Core workflow: receive stock (Entradas) → track inventory by product/lot/expiration (Inventario) → register a delivery to a clinic customer (Entregas) → print the CAI-authorized remito that travels with the goods. Products are also classified by nutritional category, relevant to the clinics being supplied.

## Capabilities and Constraints

- **Inventario (Bien):** products with nutritional category, price, weight; stock is derived (never stored directly) from its lots.
- **Lot tracking (LoteBien):** quantity plus optional expiration date per received batch; consumption is FIFO by soonest expiration.
- **Clínicas:** customer records (razón social, CUIT, domicilio, condición IVA, contacto); full CRUD; deletion is blocked while a clínica still has delivery history.
- **Entregas:** deliveries to a clínica with line items; on-screen totals (kg, price) are informational only and never appear on the printed remito.
- **Autorización CAI:** tracks ARCA-issued printing authorizations (CAI code, punto de venta, number range, expiration) and suggests the next available remito number. Never blocks creating an entrega — a missing, expired, or exhausted CAI only surfaces a warning, because the physical preimpreso paper exists independent of what is registered in the app.
- **Datos de la Empresa:** single company profile (razón social, subtítulo, CUIT, domicilio, email, condición IVA, ingresos brutos, inicio de actividades) used as the remito's letterhead/emisor data.
- No user accounts, roles, or permissions — one login, anyone with access can do anything.
- No cloud sync — fully local SQLite via Tauri; not designed for concurrent multi-machine use.
- No delivery status tracking (e.g. Entregado/En camino/Anulado) — considered and explicitly dropped as unnecessary.
- Single punto de venta / single CAI lineage assumed; the data model does not yet support two authorizations active at once.

## Brand Commitments

Business name "Vaires Medical", subtitle "División Alimentos", owned by Liliana Cesarios. Existing logo asset at `public/logoVairesMedical.png` (green medical cross + leaf mark). Established brand green already codified in `src/theme/theme.ts` (`#76B285` light / `#8FCC9E` dark). A real physical remito letterhead was supplied as reference (bold green wordmark, muted-green subtitle line, stacked address/email block, bold "IVA RESPONSABLE INSCRIPTO" line) and should be treated as the closest thing this project has to an existing print identity.

## Evidence on Hand

- A photo of Vaires Medical's real preimpreso remito, used to match the printable remito's header layout and fiscal fields (CAI box, "DOCUMENTO NO VÁLIDO COMO FACTURA", CUIT/Ingresos Brutos/Inicio de Actividades block).
- Logo file at `public/logoVairesMedical.png`.
- No customer testimonials, case studies, or third-party proof — Vaires Medical is simultaneously the app's only customer and its owner; nothing here should imply a broader customer base.

## Product Principles

1. Never let incomplete app bookkeeping block a real-world action — warn, don't block (clearest in CAI/remito numbering: a missing or exhausted authorization never prevents recording a delivery).
2. Historical and fiscal records are append-only — CAI authorizations and entrega history are never edited or deleted, only superseded by new records, preserving an audit trail.
3. Model real-world documents (remitos, lotes) so past records stay accurate even as current configuration (a new CAI, updated company data) changes later.
4. Keep scope matched to one non-technical daily operator — resist multi-user, multi-location, or permissions complexity until there's a real, current need for it.

## Accessibility & Inclusion

No accessibility requirement has been established beyond designing for a single non-technical adult operator; no assistive-technology needs have been raised.

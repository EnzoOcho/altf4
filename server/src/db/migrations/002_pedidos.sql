-- Clientes, direcciones y pedidos (checkout como invitado; cuenta opcional más adelante)

CREATE TABLE IF NOT EXISTS clientes (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,          -- siempre guardado en minúsculas
  nombre        TEXT NOT NULL,
  apellido      TEXT NOT NULL,
  telefono      TEXT NOT NULL,
  dni_cuit      TEXT NOT NULL,
  password_hash TEXT,                          -- NULL = compró como invitado, sin cuenta
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS direcciones (
  id              SERIAL PRIMARY KEY,
  cliente_id      INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  direccion       TEXT NOT NULL,               -- calle y altura, sin localidad (formato NB)
  piso_depto      TEXT,
  localidad       TEXT NOT NULL,
  provincia_id    INTEGER NOT NULL,            -- id de provincia de NB (/provinces)
  codigo_postal   TEXT NOT NULL,
  nb_direccion_id INTEGER,                     -- addressId en NB (idDirCli), se crea al enviar el pedido
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedidos (
  id                SERIAL PRIMARY KEY,
  cliente_id        INTEGER NOT NULL REFERENCES clientes(id),
  direccion_id      INTEGER NOT NULL REFERENCES direcciones(id),
  estado            TEXT NOT NULL DEFAULT 'pendiente_pago' CHECK (estado IN (
                      'pendiente_pago', 'pagado', 'enviando_a_nb', 'enviado_a_nb',
                      'despachado', 'entregado', 'cancelado', 'error_nb'
                    )),
  subtotal          NUMERIC(14,2) NOT NULL,
  envio             NUMERIC(14,2) NOT NULL,
  total             NUMERIC(14,2) NOT NULL,
  envio_carrier_id  INTEGER NOT NULL,          -- mediodeEnvioId de NB
  envio_descripcion TEXT,
  envio_plazo       TEXT,
  mp_payment_id     TEXT,
  nb_branch         TEXT,                      -- sucursal de la orden en NB (ej. "0002")
  nb_order_id       TEXT,
  nb_respuesta      JSONB,                     -- respuesta cruda de /carrito/process, para auditar
  tracking          JSONB,
  error             TEXT,                      -- último error al enviar a NB
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pedidos_estado_idx ON pedidos (estado);
CREATE INDEX IF NOT EXISTS pedidos_cliente_idx ON pedidos (cliente_id);

-- Precio y título congelados al momento de la compra
CREATE TABLE IF NOT EXISTS pedido_items (
  id              SERIAL PRIMARY KEY,
  pedido_id       INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  nb_id           INTEGER NOT NULL,
  titulo          TEXT NOT NULL,
  cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(14,2) NOT NULL,      -- nuestro precio de venta (ARS)
  costo_unitario  NUMERIC(14,2)                -- costo NB en ARS al momento de la compra
);

CREATE INDEX IF NOT EXISTS pedido_items_pedido_idx ON pedido_items (pedido_id);

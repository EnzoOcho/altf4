-- Pago a NB semi-automático: el admin paga la orden a mano y la marca como pagada

ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_estado_check;
ALTER TABLE pedidos ADD CONSTRAINT pedidos_estado_check CHECK (estado IN (
  'pendiente_pago',  -- esperando que el cliente pague
  'pagado',          -- el cliente pagó, falta armar la orden en NB
  'enviando_a_nb',   -- armando la orden en NB (en curso)
  'enviado_a_nb',    -- orden creada en NB: el admin tiene que pagarla
  'pagado_a_nb',     -- el admin le pagó a NB, esperando despacho
  'despachado',
  'entregado',
  'cancelado',
  'error_nb'         -- falló la orden en NB: revisar y reintentar
));

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS nb_total       JSONB;        -- total de la orden según NB (lo que hay que pagarle)
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS pagado_nb_at   TIMESTAMPTZ;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS pagado_nb_nota TEXT;         -- ej. nro de transferencia

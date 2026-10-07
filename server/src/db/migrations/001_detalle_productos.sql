-- Datos de detalle que antes se pedían a NB en cada visita
ALTER TABLE productos ADD COLUMN IF NOT EXISTS descripcion      TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS especificaciones JSONB NOT NULL DEFAULT '[]';
ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagenes         JSONB NOT NULL DEFAULT '[]';
-- NULL = nunca se sincronizó el detalle
ALTER TABLE productos ADD COLUMN IF NOT EXISTS detalle_sync     TIMESTAMPTZ;

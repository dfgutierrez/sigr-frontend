-- ====================================================================
-- SCRIPT SIMPLIFICADO PARA AGREGAR EL MENÚ DE ADMINISTRACIÓN
-- ====================================================================
-- Ejecuta estos comandos paso a paso para diagnosticar y solucionar el problema
-- ====================================================================

-- PASO 1: Verificar qué rol tiene tu usuario actual
-- Reemplaza 'admin' con tu nombre de usuario real
SELECT 'PASO 1: Verificando rol del usuario actual' as paso;

SELECT 
    u.id as usuario_id,
    u.username,
    u.nombre_completo,
    r.id as rol_id,
    r.nombre as rol_nombre
FROM usuario u
INNER JOIN usuario_rol ur ON u.id = ur.usuario_id
INNER JOIN rol r ON ur.rol_id = r.id
WHERE u.username = 'admin';  -- CAMBIA 'admin' por tu usuario

-- PASO 2: Ver todos los roles disponibles
SELECT 'PASO 2: Roles disponibles en el sistema' as paso;
SELECT id, nombre FROM rol ORDER BY id;

-- PASO 3: Insertar el menú de administración (si no existe)
SELECT 'PASO 3: Insertando menú de administración' as paso;

INSERT IGNORE INTO menu (nombre, ruta, icono, categoria, orden) 
VALUES ('Administrar Menús', '/admin/menu-admin', 'fa-tools', 'Administración', 3);

-- PASO 4: Obtener el ID del menú recién creado
SELECT 'PASO 4: Verificando menú creado' as paso;
SELECT id, nombre, ruta, categoria, orden 
FROM menu 
WHERE nombre = 'Administrar Menús';

-- PASO 5: Asignar el menú al rol correcto
-- IMPORTANTE: Cambia el '1' por el rol_id que obtuviste en el PASO 1
SELECT 'PASO 5: Asignando menú al rol administrador' as paso;

INSERT IGNORE INTO menu_rol (menu_id, rol_id) 
SELECT m.id, 1  -- CAMBIA EL '1' POR EL ID DE TU ROL ADMINISTRADOR
FROM menu m 
WHERE m.nombre = 'Administrar Menús';

-- PASO 6: Verificar la asignación
SELECT 'PASO 6: Verificando asignación final' as paso;

SELECT 
    m.id as menu_id,
    m.nombre as menu_nombre,
    m.ruta,
    m.categoria,
    m.orden,
    r.id as rol_id,
    r.nombre as rol_nombre
FROM menu m
INNER JOIN menu_rol mr ON m.id = mr.menu_id
INNER JOIN rol r ON mr.rol_id = r.id
WHERE m.nombre = 'Administrar Menús';

-- PASO 7: Ver todos los menús asignados a tu rol
-- IMPORTANTE: Cambia el '1' por el rol_id que obtuviste en el PASO 1
SELECT 'PASO 7: Todos los menús de tu rol' as paso;

SELECT 
    m.id,
    m.nombre,
    m.ruta,
    m.categoria,
    m.orden,
    'Asignado a tu rol' as estado
FROM menu m
INNER JOIN menu_rol mr ON m.id = mr.menu_id
WHERE mr.rol_id = 1  -- CAMBIA EL '1' POR EL ID DE TU ROL
ORDER BY m.categoria, m.orden;

-- ====================================================================
-- COMANDOS ALTERNATIVOS SI LO ANTERIOR NO FUNCIONA
-- ====================================================================

-- Si quieres asignar el menú a TODOS los roles (temporal para pruebas):
/*
INSERT IGNORE INTO menu_rol (menu_id, rol_id)
SELECT m.id, r.id
FROM menu m
CROSS JOIN rol r
WHERE m.nombre = 'Administrar Menús';
*/

-- Si necesitas eliminar y volver a crear:
/*
DELETE FROM menu_rol WHERE menu_id IN (SELECT id FROM menu WHERE nombre = 'Administrar Menús');
DELETE FROM menu WHERE nombre = 'Administrar Menús';
*/

-- ====================================================================
-- INSTRUCCIONES DE USO:
-- ====================================================================

/*
INSTRUCCIONES PASO A PASO:

1. Ejecuta el PASO 1 y anota el 'rol_id' de tu usuario

2. Ejecuta los PASOS 2-4 para crear el menú

3. En el PASO 5, reemplaza el '1' con el rol_id de tu usuario

4. En el PASO 7, reemplaza el '1' con el rol_id de tu usuario

5. Ejecuta todos los pasos en orden

6. Después de ejecutar, prueba nuevamente:
   http://localhost:8080/api/v1/menus/my-menus

7. Si aún no aparece, verifica en tu backend que el endpoint
   /menus/my-menus esté filtrando correctamente por rol

SOLUCIÓN RÁPIDA:
Si tienes prisa, ejecuta estos comandos reemplazando X con tu rol_id:

INSERT IGNORE INTO menu (nombre, ruta, icono, categoria, orden) VALUES ('Administrar Menús', '/admin/menu-admin', 'fa-tools', 'Administración', 3);
INSERT IGNORE INTO menu_rol (menu_id, rol_id) SELECT id, X FROM menu WHERE nombre = 'Administrar Menús';
*/
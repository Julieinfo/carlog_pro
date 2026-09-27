const vehiculeRoutes = require('../routes/vehiculeRoutes');
const alerteRoutes = require('../routes/alerteRoutes');
const affectationRoutes = require('../routes/affectationRoutes');
const statsRoutes = require('../routes/statsRoutes');

const roles = ['admin', 'fleet_manager', 'conducteur', 'mecanicien', 'comptable'];

function permissionMiddleware(router, method, path) {
    const route = router.stack.find((layer) => layer.route?.path === path && layer.route.methods[method]);
    if (!route) throw new Error(`Route ${method.toUpperCase()} ${path} introuvable`);
    // Le middleware protect est toujours le premier handler des routes privées.
    return route.route.stack[1].handle;
}

function isAllowed(middleware, role) {
    const req = { user: { role } };
    const res = { statusCode: null, status(code) { this.statusCode = code; return this; }, json() {} };
    let passed = false;
    middleware(req, res, () => { passed = true; });
    return passed && res.statusCode === null;
}

describe('Matrice RBAC des routes protégées', () => {
    it.each([
        [vehiculeRoutes, 'get', '/', ['admin', 'fleet_manager', 'conducteur', 'mecanicien']],
        [vehiculeRoutes, 'post', '/', ['admin', 'fleet_manager']],
        [vehiculeRoutes, 'delete', '/:id', ['admin']],
        [alerteRoutes, 'post', '/', ['admin', 'fleet_manager', 'conducteur', 'mecanicien']],
        [affectationRoutes, 'post', '/', ['admin', 'fleet_manager']],
        [statsRoutes, 'get', '/', ['admin', 'fleet_manager', 'comptable']]
    ])('%s applique les rôles attendus sur %s %s', (router, method, path, autorises) => {
        const middleware = permissionMiddleware(router, method, path);

        for (const role of roles) {
            expect(isAllowed(middleware, role)).toBe(autorises.includes(role));
        }
    });
});

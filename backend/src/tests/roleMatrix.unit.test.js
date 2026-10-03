const vehiculeRoutes = require('../routes/vehiculeRoutes');
const alerteRoutes = require('../routes/alerteRoutes');
const affectationRoutes = require('../routes/affectationRoutes');
const statsRoutes = require('../routes/statsRoutes');
const authRoutes = require('../routes/authRoutes');
const entretienRoutes = require('../routes/entretienRoutes');
const depenseRoutes = require('../routes/depenseRoutes');
const documentRoutes = require('../routes/documentRoutes');

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
        [alerteRoutes, 'delete', '/:id', ['admin', 'fleet_manager']],
        [affectationRoutes, 'post', '/', ['admin', 'fleet_manager']],
        [affectationRoutes, 'delete', '/:id', ['admin']],
        [statsRoutes, 'get', '/', ['admin', 'fleet_manager', 'comptable']],
        [entretienRoutes, 'get', '/', ['admin', 'fleet_manager', 'conducteur', 'mecanicien', 'comptable']],
        [entretienRoutes, 'post', '/', ['admin', 'fleet_manager', 'mecanicien']],
        [entretienRoutes, 'delete', '/:id', ['admin', 'fleet_manager']],
        [depenseRoutes, 'get', '/', ['admin', 'fleet_manager', 'conducteur', 'mecanicien', 'comptable']],
        [depenseRoutes, 'post', '/', ['admin', 'fleet_manager', 'comptable']],
        [depenseRoutes, 'delete', '/:id', ['admin', 'fleet_manager', 'comptable']],
        [documentRoutes, 'get', '/', ['admin', 'fleet_manager', 'conducteur', 'mecanicien', 'comptable']],
        [documentRoutes, 'post', '/', ['admin', 'fleet_manager', 'comptable']],
        [documentRoutes, 'delete', '/:id', ['admin', 'fleet_manager', 'comptable']],
        [authRoutes, 'post', '/utilisateurs', ['admin']],
        [authRoutes, 'patch', '/utilisateurs/:id', ['admin']],
        [authRoutes, 'patch', '/utilisateurs/:id/desactiver', ['admin']],
        [authRoutes, 'patch', '/utilisateurs/:id/reactiver', ['admin']]
    ])('%s applique les rôles attendus sur %s %s', (router, method, path, autorises) => {
        const middleware = permissionMiddleware(router, method, path);

        for (const role of roles) {
            expect(isAllowed(middleware, role)).toBe(autorises.includes(role));
        }
    });
});

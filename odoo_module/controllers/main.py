from odoo import http

class MagentoCegidDashboard(http.Controller):
    @http.route('/magento_cegid_dashboard', auth='public', website=True)
    def index(self, **kw):
        return http.request.render('magento_cegid_dashboard.index', {})

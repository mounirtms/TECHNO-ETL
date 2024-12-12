{
    'name': 'Magento Cegid Dashboard',
    'version': '1.0',
    'summary': 'Dashboard for Magento and Cegid integration',
    'description': 'This module integrates Magento and Cegid into Odoo, providing a dashboard for managing data.',
    'category': 'Tools',
    'author': 'Mounir Abderrahmani',
    'website': 'https://technostationary.com',
  'depends': ['base', 'web'],  # Add other dependencies as needed
    'data': [
        'views/magento_cegid_dashboard_views.xml',
        'views/magento_cegid_dashboard_menu.xml',
    ],
    'assets': {
        'web.assets_backend': [
            '/odoo_module/static/src/js/dsist_integration.js', # If using custom JS
        ],
    },
    'qweb': [],
    'installable': True,
    'application': True,
    'auto_install': False,
}

{
    'name': 'Magento Cegid Dashboard',
    'version': '1.0',
    'summary': 'Dashboard for Magento and Cegid integration',
    'description': 'This module integrates Magento and Cegid into Odoo, providing a dashboard for managing data.',
    'category': 'Tools',
    'author': 'Your Company',
    'website': 'https://yourcompany.com',
    'depends': ['base'],
    'data': [
        'views/magento_cegid_dashboard_views.xml',
        'views/magento_cegid_dashboard_menu.xml',
    ],
    'qweb': [],
    'installable': True,
    'application': True,
    'auto_install': False,
}

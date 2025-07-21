// Categories ready for Magento API posting
// Each object can be posted individually to /V1/categories endpoint

const categories = [
    // Main parent category
    {
        "category": {
            "parent_id": 1,
            "name": "تكنو",
            "is_active": true,
            "include_in_menu": true,
            "position": 1,
            "level": 1,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "techno"
                }
            ]
        }
    },
    
    // Level 2 Categories
    {
        "category": {
            "parent_id": 2,
            "name": "القرطاسية المدرسية",
            "is_active": true,
            "include_in_menu": true,
            "position": 1,
            "level": 2,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "school-stationery"
                }
            ]
        }
    },
    {
        "category": {
            "parent_id": 2,
            "name": "الفنون والإبداع",
            "is_active": true,
            "include_in_menu": true,
            "position": 2,
            "level": 2,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "arts-and-creativity"
                }
            ]
        }
    },
    {
        "category": {
            "parent_id": 2,
            "name": "المكتب والأعمال",
            "is_active": true,
            "include_in_menu": true,
            "position": 3,
            "level": 2,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "office-and-business"
                }
            ]
        }
    },
    {
        "category": {
            "parent_id": 2,
            "name": "الحقائب والأغطية",
            "is_active": true,
            "include_in_menu": true,
            "position": 4,
            "level": 2,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "bags-and-cases"
                }
            ]
        }
    },

    // School Stationery Subcategories
    {
        "category": {
            "parent_id": 2415,
            "name": "أدوات الكتابة",
            "is_active": true,
            "include_in_menu": true,
            "position": 1,
            "level": 3,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "writing-tools"
                }
            ]
        }
    },
    {
        "category": {
            "parent_id": 2415,
            "name": "الدفاتر والكراسات",
            "is_active": true,
            "include_in_menu": true,
            "position": 2,
            "level": 3,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "notebooks-and-pads"
                }
            ]
        }
    },
    {
        "category": {
            "parent_id": 2415,
            "name": "الأدوات الهندسية",
            "is_active": true,
            "include_in_menu": true,
            "position": 3,
            "level": 3,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "geometric-tools"
                }
            ]
        }
    },

    // Arts and Creativity Subcategories
    {
        "category": {
            "parent_id": 2414,
            "name": "مستلزمات الرسم",
            "is_active": true,
            "include_in_menu": true,
            "position": 1,
            "level": 3,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "drawing-supplies"
                }
            ]
        }
    },
    {
        "category": {
            "parent_id": 2414,
            "name": "الحرف اليدوية",
            "is_active": true,
            "include_in_menu": true,
            "position": 2,
            "level": 3,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "handicrafts"
                }
            ]
        }
    },

    // Office and Business Subcategories
    {
        "category": {
            "parent_id": 2409,
            "name": "الآلات الحاسبة",
            "is_active": true,
            "include_in_menu": true,
            "position": 1,
            "level": 3,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "calculators"
                }
            ]
        }
    },
    {
        "category": {
            "parent_id": 2409,
            "name": "لوازم مكتبية",
            "is_active": true,
            "include_in_menu": true,
            "position": 2,
            "level": 3,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "office-supplies"
                }
            ]
        }
    },

    // New Bags and Cases Categories
    {
        "category": {
            "parent_id": 2440,
            "name": "حقائب مدرسية",
            "is_active": true,
            "include_in_menu": true,
            "position": 1,
            "level": 3,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "school-bags"
                },
                {
                    "attribute_code": "description",
                    "value": "تشكيلة واسعة من الحقائب المدرسية العصرية والمتينة"
                }
            ]
        }
    },
    {
        "category": {
            "parent_id": 2440,
            "name": "حقائب لابتوب",
            "is_active": true,
            "include_in_menu": true,
            "position": 2,
            "level": 3,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "laptop-bags"
                }
            ]
        }
    },
    {
        "category": {
            "parent_id": 2440,
            "name": "أغطية الأجهزة",
            "is_active": true,
            "include_in_menu": true,
            "position": 3,
            "level": 3,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "device-cases"
                }
            ],
            "children_data": [
                {
                    "category": {
                        "parent_id": 2443,
                        "name": "أغطية لابتوب",
                        "is_active": true,
                        "include_in_menu": true,
                        "position": 1,
                        "level": 4,
                        "custom_attributes": [
                            {
                                "attribute_code": "url_key",
                                "value": "laptop-covers"
                            }
                        ]
                    }
                },
                {
                    "category": {
                        "parent_id": 2443,
                        "name": "أغطية تابلت",
                        "is_active": true,
                        "include_in_menu": true,
                        "position": 2,
                        "level": 4,
                        "custom_attributes": [
                            {
                                "attribute_code": "url_key",
                                "value": "tablet-covers"
                            }
                        ]
                    }
                }
            ]
        }
    },
    {
        "category": {
            "parent_id": 2440,
            "name": "محافظ وجرابات",
            "is_active": true,
            "include_in_menu": true,
            "position": 4,
            "level": 3,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "pouches-and-cases"
                }
            ]
        }
    }
];

// Example of how to use with Magento API:
/*
categories.forEach(async (category) => {
    try {
        const response = await fetch('/rest/V1/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(category)
        });
        const data = await response.json();
        console.log('Category created:', data);
    } catch (error) {
        console.error('Error creating category:', error);
    }
});
*/

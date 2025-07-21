// New categories and subcategories to be added to existing structure
const newCategories = [
    // New subcategories for "المدرسة والمكتب" (ID: 2415)
    {
        "category": {
            "parent_id": 2415,
            "name": "الدفاتر المدرسية",
            "is_active": true,
            "include_in_menu": true,
            "position": 2,
            "level": 3,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "school-notebooks"
                },
                {
                    "attribute_code": "description",
                    "value": "دفاتر مدرسية عالية الجودة بمختلف المقاسات والأنواع"
                }
            ]
        }
    },
    {
        "category": {
            "parent_id": 2415,
            "name": "مستلزمات الرسم الهندسي",
            "is_active": true,
            "include_in_menu": true,
            "position": 3,
            "level": 3,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "technical-drawing-supplies"
                }
            ]
        }
    },

    // New subcategories for "الفنون والرسم" (ID: 2414)
    {
        "category": {
            "parent_id": 2414,
            "name": "ألوان وأصباغ",
            "is_active": true,
            "include_in_menu": true,
            "position": 3,
            "level": 3,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "colors-and-paints"
                }
            ]
        }
    },
    {
        "category": {
            "parent_id": 2414,
            "name": "فرش ولوازم الرسم",
            "is_active": true,
            "include_in_menu": true,
            "position": 4,
            "level": 3,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "brushes-and-art-supplies"
                }
            ]
        }
    },

    // New subcategories for "الحقائب والأغطية" (ID: 2419)
    {
        "category": {
            "parent_id": 2419,
            "name": "حقائب مدرسية",
            "is_active": true,
            "include_in_menu": true,
            "position": 1,
            "level": 3,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "school-bags"
                }
            ]
        }
    },
    {
        "category": {
            "parent_id": 2419,
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
            "parent_id": 2419,
            "name": "أغطية الأجهزة الإلكترونية",
            "is_active": true,
            "include_in_menu": true,
            "position": 3,
            "level": 3,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "electronic-device-covers"
                }
            ]
        }
    },
    {
        "category": {
            "parent_id": 2419,
            "name": "حقائب رياضية",
            "is_active": true,
            "include_in_menu": true,
            "position": 4,
            "level": 3,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "sports-bags"
                }
            ]
        }
    },

    // Expanding "الأدوات المكتبية" (ID: 2409) with new subcategories
    {
        "category": {
            "parent_id": 2409,
            "name": "منظمات المكتب",
            "is_active": true,
            "include_in_menu": true,
            "position": 5,
            "level": 3,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "desk-organizers"
                }
            ]
        }
    },
    {
        "category": {
            "parent_id": 2409,
            "name": "ملفات وحافظات",
            "is_active": true,
            "include_in_menu": true,
            "position": 6,
            "level": 3,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "files-and-folders"
                }
            ]
        }
    },
    {
        "category": {
            "parent_id": 2409,
            "name": "لوازم التغليف",
            "is_active": true,
            "include_in_menu": true,
            "position": 7,
            "level": 3,
            "custom_attributes": [
                {
                    "attribute_code": "url_key",
                    "value": "packaging-supplies"
                }
            ]
        }
    }
];

// Example of how to use with Magento API:
/*
async function createCategories() {
    for (const category of newCategories) {
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
            // Wait a short time between requests to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Error creating category:', error);
        }
    }
}

// Run the creation process
createCategories();
*/

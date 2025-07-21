const axios = require('axios');

const baseUrl = 'https://technostationery.com';
const accessToken ="eyJraWQiOiIxIiwiYWxnIjoiSFMyNTYifQ.eyJ1aWQiOjMsInV0eXBpZCI6MiwiaWF0IjoxNzM2MjYyMzc0LCJleHAiOjM4OTYyNjIzNzR9.RYn5fY1SQs-tAP5UkpuEC9iiNQALKfNKLyuy544S5Mo"

const attributeSetPayload =  [
      {
        "group": {
          "attribute_group_id": "general_info",
          "attribute_group_name": "General Information",
          "attribute_set_id": 1,
          "extension_attributes": {
            "attribute_group_code": "general_info",
            "sort_order": "1"
          }
        }
      },
      {
        "group": {
          "attribute_group_id": "dimensions",
          "attribute_group_name": "Dimensions",
          "attribute_set_id": 1,
          "extension_attributes": {
            "attribute_group_code": "dimensions",
            "sort_order": "2"
          }
        }
      },
      {
        "group": {
          "attribute_group_id": "material",
          "attribute_group_name": "Material",
          "attribute_set_id": 1,
          "extension_attributes": {
            "attribute_group_code": "material",
            "sort_order": "3"
          }
        }
      },
      {
        "group": {
          "attribute_group_id": "usage",
          "attribute_group_name": "Usage",
          "attribute_set_id": 1,
          "extension_attributes": {
            "attribute_group_code": "usage",
            "sort_order": "4"
          }
        }
      },
      {
        "group": {
          "attribute_group_id": "color_options",
          "attribute_group_name": "Color Options",
          "attribute_set_id": 1,
          "extension_attributes": {
            "attribute_group_code": "color_options",
            "sort_order": "5"
          }
        }
      },
      {
        "group": {
          "attribute_group_id": "country_of_origin",
          "attribute_group_name": "Country of Origin",
          "attribute_set_id": 1,
          "extension_attributes": {
            "attribute_group_code": "country_of_origin",
            "sort_order": "6"
          }
        }
      },
      {
        "group": {
          "attribute_group_id": "packaging_details",
          "attribute_group_name": "Packaging Details",
          "attribute_set_id": 1,
          "extension_attributes": {
            "attribute_group_code": "packaging_details",
            "sort_order": "7"
          }
        }
      },
      {
        "group": {
          "attribute_group_id": "sustainability",
          "attribute_group_name": "Sustainability",
          "attribute_set_id": 1,
          "extension_attributes": {
            "attribute_group_code": "sustainability",
            "sort_order": "8"
          }
        }
      },
      {
        "group": {
          "attribute_group_id": "additional_features",
          "attribute_group_name": "Additional Features",
          "attribute_set_id": 1,
          "extension_attributes": {
            "attribute_group_code": "additional_features",
            "sort_order": "9"
          }
        }
      }
    ];
  
 
    const postAttributeSetGroups = async (group) => {
      try {
        const response = await axios.put(
          `${baseUrl}/rest/V1/products/attribute-sets/groups`,
          group,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        console.log(`Updated successfully: ${group.group.attribute_group_name}`);
      } catch (error) {
        console.error(`Failed: `, error.response ? error.response.data : error.message);
      }
    };
    
    const updateAttributeGroups = async () => {
      for (const group of attributeSetPayload) {
        await postAttributeSetGroups(group);
        console.log('---');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
      }
    };
    
    updateAttributeGroups();
    
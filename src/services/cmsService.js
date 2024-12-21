import magentoApi from './magentoApi';

const cmsService = {
    getCmsPages: async () => {
        try {
            const response = await magentoApi.get('/cmsPage/search');
            return response.data.items || [];
        } catch (error) {
            console.error('Error fetching CMS pages:', error);
            throw error;
        }
    },

    getCmsPage: async (id) => {
        try {
            const response = await magentoApi.get(`/cmsPage/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching CMS page:', error);
            throw error;
        }
    },

    createCmsPage: async (pageData) => {
        try {
            const response = await magentoApi.post('/cmsPage', pageData);
            return response.data;
        } catch (error) {
            console.error('Error creating CMS page:', error);
            throw error;
        }
    },

    updateCmsPage: async (id, pageData) => {
        try {
            const response = await magentoApi.put(`/cmsPage/${id}`, pageData);
            return response.data;
        } catch (error) {
            console.error('Error updating CMS page:', error);
            throw error;
        }
    },

    deleteCmsPage: async (id) => {
        try {
            await magentoApi.delete(`/cmsPage/${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting CMS page:', error);
            throw error;
        }
    }
};

export default cmsService;
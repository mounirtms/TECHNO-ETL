/**
 * Unified API Router System
 * 
 * Provides centralized routing for all API services (MDM, Magento, Cegid)
 * with configuration-based routing strategies and user settings integration.
 * 
 * Requirements: 4.1, 4.2, 4.3, 9.1, 9.2
 * 
 * @author TECHNO-ETL Team
 */

import { BaseApiService } from './BaseApiService';
import { getUnifiedSettings, getUserSetting
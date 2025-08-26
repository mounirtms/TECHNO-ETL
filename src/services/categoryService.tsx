import React from 'react';
/**
 * Category Service
 * Handles category data from local JSON file and provides tree utilities
 * 
 * @author Techno-ETL Team
 * @version 1.0.0
 */

import categoryData from '../assets/data/category.json';

// TypeScript interfaces
interface CategoryData {
  id: number;
  name: string;
  parent_id?: number;
  product_count?: number;
  is_active: boolean;
  children_data?: CategoryData[];
interface FlatCategory extends CategoryData {
  level: number;
  path: string;
  hasChildren: boolean;
  parentPath: string;
interface ComboCategory {
  id: number;
  label: string;
  value: number;
  level: number;
  name: string;
  parent_id?: number;
  product_count?: number;
  is_active: boolean;
interface BreadcrumbItem {
  id: number;
  name: string;
  level: number;
interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  levels: number;
  totalProducts: number;
/**
 * Flatten category tree into a flat array with hierarchy information
 */
const flattenCategories = (categories: CategoryData | CategoryData[], level = 0, parentPath = ''): FlatCategory[] => {
  const result: FlatCategory[] = [];
  
  const processCategory = (category: CategoryData, currentLevel: number, path: string) => {
    const categoryPath = path ? `${path} > ${category.name}` : category.name;
    
    // Add current category
    result.push({ ...category,
      level: currentLevel,
      path: categoryPath,
      hasChildren: category.children_data && category.children_data.length > 0,
      parentPath: path
    });
    
    // Process children recursively
    if(category.children_data && category.children_data.length > 0) {
      category.children_data.forEach((child) => {
        processCategory(child, currentLevel + 1, categoryPath);

      });
  };
  
  if (Array.isArray(categories)) {
    categories.forEach((category) => processCategory(category, level, parentPath));
  } else {
    processCategory(categories, level, parentPath);
  return result;
};

/**
 * Get all categories as flat array
 */
export const getAllCategories = () => {
  return flattenCategories(categoryData);
};

/**
 * Get categories for combo/select components
 */
export const getCategoriesForCombo = () => {
  const flatCategories = getAllCategories();
  
  return flatCategories.map((category: any) => ({
    id: category.id,
    label: category.path,
    value: category.id,
    level: category.level,
    name: category.name,
    parent_id: category.parent_id,
    product_count: category.product_count,
    is_active: category.is_active
  }));
};

/**
 * Get category tree for tree display
 */
export const getCategoryTree = () => {
  return categoryData;
};

/**
 * Find category by ID
 */
export const findCategoryById = (id) => {
  const flatCategories = getAllCategories();
  return flatCategories.find(cat => cat.id ===parseInt(id));
};

/**
 * Get category children
 */
export const getCategoryChildren = (parentId) => {
  const flatCategories = getAllCategories();
  return flatCategories.filter((cat: any) => cat.parent_id ===parseInt(parentId));
};

/**
 * Get category path as breadcrumb
 */
export const getCategoryBreadcrumb = (categoryId) => {
  const category = findCategoryById(categoryId);
  if (!category) return [];
  
  const breadcrumb = [];
  let current = category;
  
  while(current) {
    breadcrumb.unshift({
      id: current.id,
      name: current.name,
      level: current.level
    });
    
    if(current.parent_id) {
      current

    } else {
      break;
  return breadcrumb;
};

/**
 * Search categories by name
 */
export const searchCategories = (searchTerm) => {
  if (!searchTerm) return getAllCategories();
  
  const flatCategories = getAllCategories();
  const term = searchTerm.toLowerCase();
  
  return flatCategories.filter((category: any) =>
    category.name.toLowerCase().includes(term) ||
    category.path.toLowerCase().includes(term)
  );
};

/**
 * Get categories by level
 */
export const getCategoriesByLevel = (level) => {
  const flatCategories = getAllCategories();
  return flatCategories.filter((cat: any) => cat.level ===level);
};

/**
 * Get root categories
 */
export const getRootCategories = () => {
  return getCategoriesByLevel(1);
};

/**
 * Get category statistics
 */
export const getCategoryStats = () => {
  const flatCategories = getAllCategories();
  
  return {
    total: flatCategories.length,
    active: flatCategories.filter((cat: any) => cat.is_active).length,
    inactive: flatCategories.filter((cat: any) => !cat.is_active).length,
    levels: Math.max(...flatCategories.map((cat: any) => cat.level)),
    totalProducts: flatCategories.reduce((sum: any, cat: any) => sum + (cat.product_count || 0), 0)
  };
};

/**
 * Format category for display in grids
 */
export const formatCategoryForGrid = (category) => {
  return { ...category,
    displayName: `${'  '.repeat(category.level)}${category.name}`,
    statusText: category.is_active ? 'Active' : 'Inactive',
    levelText: `Level ${category.level}`,
    productCountText: `${category.product_count || 0} products`
  };
};

/**
 * Get visible categories for tree display (with expansion state)
 */
export const getVisibleCategories = (expandedIds = new Set()) => {
  const allCategories = getAllCategories();
  
  return allCategories.filter((category: any) => {
    // Always show root level
    if (category.level <= 1) return true;
    
    // Show if parent is expanded
    return expandedIds.has(category.parent_id);
  });
};

export default {
  getAllCategories,
  getCategoriesForCombo,
  getCategoryTree,
  findCategoryById,
  getCategoryChildren,
  getCategoryBreadcrumb,
  searchCategories,
  getCategoriesByLevel,
  getRootCategories,
  getCategoryStats,
  formatCategoryForGrid,
  getVisibleCategories
};

-- Optimized Category Creation Script
-- Generated on 2025-07-19T11:28:57.068Z
-- Based on audit report recommendations (max 3-4 levels)

-- This script creates the optimized category structure
-- Run this in your Magento database before importing products

USE your_magento_database;

-- Create main categories

-- BUREAUTIQUE & INFORMATIQUE (Level 0)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (100, 3, 2, NOW(), NOW(), '1/2/100', 1, 1, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  100,
  'BUREAUTIQUE & INFORMATIQUE'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  100,
  1
);

-- CALCULATRICES (Level 1)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (101, 3, parent_category_id, NOW(), NOW(), '1/2/101', 2, 2, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  101,
  'CALCULATRICES'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  101,
  1
);

-- CALCULATRICES SCIENTIFIQUES (Level 2)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (102, 3, parent_category_id, NOW(), NOW(), '1/2/102', 3, 3, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  102,
  'CALCULATRICES SCIENTIFIQUES'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  102,
  1
);

-- CALCULATRICES GRAPHIQUES (Level 2)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (103, 3, parent_category_id, NOW(), NOW(), '1/2/103', 4, 3, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  103,
  'CALCULATRICES GRAPHIQUES'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  103,
  1
);

-- CALCULATRICES DE POCHE (Level 2)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (104, 3, parent_category_id, NOW(), NOW(), '1/2/104', 5, 3, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  104,
  'CALCULATRICES DE POCHE'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  104,
  1
);

-- CALCULATRICES DE BUREAU (Level 2)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (105, 3, parent_category_id, NOW(), NOW(), '1/2/105', 6, 3, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  105,
  'CALCULATRICES DE BUREAU'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  105,
  1
);

-- CALCULATRICES IMPRIMANTES (Level 2)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (106, 3, parent_category_id, NOW(), NOW(), '1/2/106', 7, 3, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  106,
  'CALCULATRICES IMPRIMANTES'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  106,
  1
);

-- EQUIPEMENT ELECTRONIQUE (Level 1)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (107, 3, parent_category_id, NOW(), NOW(), '1/2/107', 8, 2, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  107,
  'EQUIPEMENT ELECTRONIQUE'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  107,
  1
);

-- ETIQUETEUSES (Level 2)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (108, 3, parent_category_id, NOW(), NOW(), '1/2/108', 9, 3, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  108,
  'ETIQUETEUSES'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  108,
  1
);

-- PLASTIFIEUSES (Level 2)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (109, 3, parent_category_id, NOW(), NOW(), '1/2/109', 10, 3, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  109,
  'PLASTIFIEUSES'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  109,
  1
);

-- ECRITURE & COLORIAGE (Level 0)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (110, 3, 2, NOW(), NOW(), '1/2/110', 11, 1, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  110,
  'ECRITURE & COLORIAGE'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  110,
  1
);

-- STYLOS (Level 1)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (111, 3, parent_category_id, NOW(), NOW(), '1/2/111', 12, 2, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  111,
  'STYLOS'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  111,
  1
);

-- STYLOS ENCRE GEL (Level 2)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (112, 3, parent_category_id, NOW(), NOW(), '1/2/112', 13, 3, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  112,
  'STYLOS ENCRE GEL'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  112,
  1
);

-- STYLOS ENCRE LIQUIDE (Level 2)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (113, 3, parent_category_id, NOW(), NOW(), '1/2/113', 14, 3, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  113,
  'STYLOS ENCRE LIQUIDE'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  113,
  1
);

-- STYLOS BILLE (Level 2)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (114, 3, parent_category_id, NOW(), NOW(), '1/2/114', 15, 3, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  114,
  'STYLOS BILLE'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  114,
  1
);

-- FEUTRES & MARQUEURS (Level 1)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (115, 3, parent_category_id, NOW(), NOW(), '1/2/115', 16, 2, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  115,
  'FEUTRES & MARQUEURS'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  115,
  1
);

-- FEUTRES POINTE FINE (Level 2)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (116, 3, parent_category_id, NOW(), NOW(), '1/2/116', 17, 3, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  116,
  'FEUTRES POINTE FINE'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  116,
  1
);

-- FEUTRES COLORIAGE (Level 2)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (117, 3, parent_category_id, NOW(), NOW(), '1/2/117', 18, 3, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  117,
  'FEUTRES COLORIAGE'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  117,
  1
);

-- SURLIGNEURS (Level 1)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (118, 3, parent_category_id, NOW(), NOW(), '1/2/118', 19, 2, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  118,
  'SURLIGNEURS'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  118,
  1
);

-- SCOLAIRE (Level 0)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (119, 3, 2, NOW(), NOW(), '1/2/119', 20, 1, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  119,
  'SCOLAIRE'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  119,
  1
);

-- CAHIERS & CARNETS (Level 1)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (120, 3, parent_category_id, NOW(), NOW(), '1/2/120', 21, 2, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  120,
  'CAHIERS & CARNETS'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  120,
  1
);

-- CLASSEURS & RANGEMENT (Level 1)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (121, 3, parent_category_id, NOW(), NOW(), '1/2/121', 22, 2, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  121,
  'CLASSEURS & RANGEMENT'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  121,
  1
);

-- FOURNITURES DIVERSES (Level 1)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (122, 3, parent_category_id, NOW(), NOW(), '1/2/122', 23, 2, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  122,
  'FOURNITURES DIVERSES'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  122,
  1
);

-- BEAUX ARTS (Level 0)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (123, 3, 2, NOW(), NOW(), '1/2/123', 24, 1, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  123,
  'BEAUX ARTS'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  123,
  1
);

-- COULEURS & PEINTURES (Level 1)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (124, 3, parent_category_id, NOW(), NOW(), '1/2/124', 25, 2, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  124,
  'COULEURS & PEINTURES'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  124,
  1
);

-- PEINTURE ACRYLIQUE (Level 2)
INSERT INTO catalog_category_entity (entity_id, attribute_set_id, parent_id, created_at, updated_at, path, position, level, children_count)
VALUES (125, 3, parent_category_id, NOW(), NOW(), '1/2/125', 26, 3, 0);

INSERT INTO catalog_category_entity_varchar (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3),
  0,
  125,
  'PEINTURE ACRYLIQUE'
);

INSERT INTO catalog_category_entity_int (attribute_id, store_id, entity_id, value)
VALUES (
  (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'is_active' AND entity_type_id = 3),
  0,
  125,
  1
);

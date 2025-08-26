/**
 * Object-Oriented Column Factory System
 * Provides standardized, reusable column definitions with proper type handling
 */

import React from 'react';
import { format } from 'date-fns';
import { Chip, Typography, Box } from '@mui/material';
import { StatusCell } from '../components/common/StatusCell';

// ===== BASE COLUMN CLASS =====
class BaseColumn {
  constructor(field, options: any = {}) {
    this.field = field;
    this.headerName = options.headerName || this.generateHeaderName(field);
    this.width = options.width || 150;
    this.sortable = options.sortable !== false;
    this.filterable = options.filterable !== false;
    this.resizable = options.resizable !== false;
    this.hideable = options.hideable !== false;
    this.flex = options.flex || 0;
    this.minWidth = options.minWidth || 80;
    this.maxWidth = options.maxWidth || 400;
    this.align = options.align || 'left';
    this.headerAlign = options.headerAlign || this.align;
    
    // Apply any additional options
    Object.assign(this, options);
  generateHeaderName(field: any) {
    return field
      .split('_')
      .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  build() {
    return {
      field: this.field,
      headerName: this.headerName,
      width: this.width,
      sortable: this.sortable,
      filterable: this.filterable,
      resizable: this.resizable,
      hideable: this.hideable,
      flex: this.flex,
      minWidth: this.minWidth,
      maxWidth: this.maxWidth,
      align: this.align,
      headerAlign: this.headerAlign,
      type: this.type || 'string'
    };
// ===== TEXT COLUMN =====
class TextColumn extends BaseColumn {
  constructor(field, options = {} ) {
    super(field, options);
    this.type = 'string';
// ===== NUMBER COLUMN =====
class NumberColumn extends BaseColumn {
  constructor(field, options = {} ) {
    super(field, {
      align: 'right',
      headerAlign: 'right',
      ...options
    });
    this.type = 'number';
  build() {
    const column = super.build();
    column.valueFormatter = (params) => {
      if (!params || params.value ===null || params.value === '') return '';
      try {
        return new Intl.NumberFormat('fr-DZ').format(params.value);
  } catch (error) {
    console.error(error);

  } catch (error) {
    console.error(error);

      } catch(error: any) {
        console.warn('Number formatting error:', error, params);
        return String(params.value || '');
    };
    return column;
// ===== CURRENCY COLUMN =====
class CurrencyColumn extends BaseColumn {
  constructor(field, options = {} ) {
    super(field, {
      align: 'right',
      headerAlign: 'right',
      width: 130,
      ...options
    });
    this.type = 'number';
    this.currency = options?.currency || 'DZD';
  build() {
    const column = super.build();
    column.valueFormatter = (params) => {
      if (!params || params.value ===null || params.value === '') return '';
      try {
        return new Intl.NumberFormat('fr-DZ', {
          style: 'currency',
          currency: this.currency
  } catch (error) {
    console.error(error);

  } catch (error) {
    console.error(error);

        }).format(params.value);
      } catch(error: any) {
        console.warn('Currency formatting error:', error, params);
        return String(params.value || '');
    };
    return column;
// ===== DATE COLUMN =====
class DateColumn extends BaseColumn {
  constructor(field, options = {} ) {
    super(field, {
      align: 'center',
      headerAlign: 'center',
      width: 180,
      ...options
    });
    this.type = 'string'; // Use string to avoid MUI X Date object requirement
    this.dateFormat = options?.dateFormat || 'PPp';
  build() {
    const column = super.build();
    
    // Use valueGetter to convert string dates to Date objects safely
    column.valueGetter = (params) => {
      if (!params || !params.value) return '';
      try {
        const date = new Date(params.value);
        return isNaN(date.getTime()) ? params.value : date;
  } catch (error) {
    console.error(error);

  } catch (error) {
    console.error(error);

      } catch(error: any) {
        console.warn('Date valueGetter error:', error, params);
        return params.value;
    };

    // Use valueFormatter to display formatted dates
    column.valueFormatter = (params) => {
      if (!params || !params.value) return '';
      try {
        const date = params.value instanceof Date ? params.value : new Date(params.value);
        return isNaN(date.getTime()) ? 'Invalid Date' : format(date, this.dateFormat);
  } catch (error) {
    console.error(error);

  } catch (error) {
    console.error(error);

      } catch(error: any) {
        console.warn('Date formatting error:', error, params);
        return 'Invalid Date';
    };

    return column;
// ===== DATETIME COLUMN =====
class DateTimeColumn extends DateColumn {
  constructor(field, options = {} ) {
    super(field, {
      width: 200,
      dateFormat: 'PPp', // Full date and time
      ...options
    });
// ===== STATUS COLUMN =====
class StatusColumn extends BaseColumn {
  constructor(field, options = {} ) {
    super(field, {
      width: 120,
      align: 'center',
      headerAlign: 'center',
      ...options
    });
    this.type = 'singleSelect';
    this.statusColors = options?.statusColors || {};
    this.valueOptions = options?.valueOptions || [];
  build() {
    const column = super.build();
    column.valueOptions = this.valueOptions;
    column.renderCell = (params) => {
      if (!params.value) return null;
      return (
        <StatusCell
          value={params.value}
          statusColors={this.statusColors}
        />););
      );
    };
    return column;
// ===== BOOLEAN COLUMN =====
class BooleanColumn extends BaseColumn {
  constructor(field, options = {} ) {
    super(field, {
      width: 100,
      align: 'center',
      headerAlign: 'center',
      ...options
    });
    this.type = 'boolean';
  build() {
    const column = super.build();
    column.renderCell = (params) => {
      const value = params.value;
      return (
        <Chip
          label={value ? 'Yes' : 'No'}
          color={value ? 'success' : 'default'}
          size="small"
    };
    return column;
// ===== ACTIONS COLUMN =====
class ActionsColumn extends BaseColumn {););
  constructor(field = 'actions', options = {} ) {
    super(field, {
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      ...options
    });
    this.type = 'actions';
    this.actions = options?.actions || [];
  build() {
    const column = super.build();
    column.renderCell = (params) => {
      return (
        <Box sx={{ display: 'flex', gap: 1 } as any}>););
          {this.actions.map((action: any, index: any) => (
            <action.component
              key={index}
              onClick={() => action.onClick(params.row)}
              { ...action.props}
            />
          ))}
        </Box>
      );
    };
    return column;
// ===== COLUMN FACTORY =====
export class ColumnFactory {
  static text(field, options = {} ) {
    return new TextColumn(field, options).build();
  static number(field, options = {} ) {
    return new NumberColumn(field, options).build();
  static currency(field, options = {} ) {
    return new CurrencyColumn(field, options).build();
  static date(field, options = {} ) {
    return new DateColumn(field, options).build();
  static dateTime(field, options = {} ) {
    return new DateTimeColumn(field, options).build();
  static status(field, options = {} ) {
    return new StatusColumn(field, options).build();
  static boolean(field, options = {} ) {
    return new BooleanColumn(field, options).build();
  static actions(field, options = {} ) {
    return new ActionsColumn(field, options).build();
  // Auto-detect column type based on field name and value
  static auto(field, sampleValue, options = {} ) {
    if (field.includes('price') || field.includes('total') || field.includes('amount')) {
      return this.currency(field, options);
    if (field.includes('date') || field.includes('time') || field.includes('created_at') || field.includes('updated_at')) {
      return this.dateTime(field, options);
    if (field.includes('status') || field.includes('state')) {
      return this.status(field, options);
    if(typeof sampleValue === 'boolean') {
      return this.boolean(field, options);


    if(typeof sampleValue === 'number') {
      return this.number(field, options);


    return this.text(field, options);
// ===== COLUMN RENDERER REGISTRY =====
export class ColumnRendererRegistry {
  static renderers = new Map();

  static register(name, renderer: any) {
    this.renderers.set(name, renderer);
  } catch (error) {
    console.error(error);

  } catch (error) {
    console.error(error);


  static get(name: any) {
    return this.renderers.get(name);
  static has(name: any) {
    return this.renderers.has(name);
// Register default renderers
ColumnRendererRegistry.register('status', StatusCell);
ColumnRendererRegistry.register('chip', ({ value, color = 'default', variant = 'filled' }) => (
  <Chip label={value} color={color} variant={variant} size="small" />
));

export default ColumnFactory;

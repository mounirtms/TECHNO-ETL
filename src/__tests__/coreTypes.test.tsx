/**
 * Type Assertion Test for Core Types
 * 
 * This file contains type assertions that verify our core type definitions
 * are working correctly at compile-time.
 */

import React from 'react';
import { assertType, assertAssignable, assertNotAssignable } from './typeUtils';
import * as CoreTypes from '../types';
import * as ComponentTypes from '../types/components';
import * as BaseComponentTypes from '../types/baseComponents';

describe('Core Type Definitions', () => {
  it('User type has correct structure', () => {
    // These tests are only checked at compile-time, not runtime
    const validUser: CoreTypes.User = {
      id: '1234',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
    };

    assertType(validUser, {} as CoreTypes.User);
    
    // @ts-expect-error - Missing required fields
    const invalidUser: CoreTypes.User = {
      id: '1234',
      // username is missing
      email: 'test@example.com',
    };
  });

  it('ApiResponse type has correct structure', () => {
    const validResponse: CoreTypes.ApiResponse<string> = {
      data: 'test data',
      success: true,
      message: 'Success',
      statusCode: 200,
    };
    
    assertType(validResponse, {} as CoreTypes.ApiResponse<string>);
    
    // Error response
    const errorResponse: CoreTypes.ApiResponse<null> = {
      data: null,
      success: false,
      message: 'Not found',
      statusCode: 404,
      error: {
        code: 'NOT_FOUND',
        details: 'Resource not found',
      },
    };
    
    assertType(errorResponse, {} as CoreTypes.ApiResponse<null>);
  });

  it('PaginatedResponse type has correct structure', () => {
    const validPaginatedResponse: CoreTypes.PaginatedResponse<string[]> = {
      data: ['item1', 'item2'],
      success: true,
      message: 'Success',
      statusCode: 200,
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 100,
        totalPages: 10,
      },
    };
    
    assertType(validPaginatedResponse, {} as CoreTypes.PaginatedResponse<string[]>);
    
    // Paginated response should be assignable to ApiResponse
    assertAssignable(validPaginatedResponse, {} as CoreTypes.ApiResponse<string[]>);
    
    // ApiResponse should not be assignable to PaginatedResponse
    const simpleResponse: CoreTypes.ApiResponse<string[]> = {
      data: ['item1', 'item2'],
      success: true,
      message: 'Success',
      statusCode: 200,
    };
    
    assertNotAssignable(simpleResponse, {} as CoreTypes.PaginatedResponse<string[]>);
  });
});

describe('Component Type Definitions', () => {
  it('BaseComponentProps has correct structure', () => {
    const props: ComponentTypes.BaseComponentProps = {
      id: 'test-id',
      className: 'test-class',
      style: { color: 'red' },
    };
    
    assertType(props, {} as ComponentTypes.BaseComponentProps);
  });
  
  it('GridProps extends BaseComponentProps', () => {
    const gridProps: ComponentTypes.GridProps = {
      id: 'test-id',
      className: 'test-class',
      data: [{ id: 1, name: 'Test' }],
      columns: [{ field: 'name', headerName: 'Name' }],
      loading: false,
    };
    
    assertType(gridProps, {} as ComponentTypes.GridProps);
    assertAssignable(gridProps, {} as ComponentTypes.BaseComponentProps);
  });
  
  it('BaseToolbarProps has correct structure', () => {
    const toolbarProps: BaseComponentTypes.BaseToolbarProps = {
      title: 'Test Toolbar',
      leftItems: [<div key="left">Left</div>],
      rightItems: [<div key="right">Right</div>],
      middleItems: [<div key="middle">Middle</div>],
      onRefresh: () => {},
      loading: false,
    };
    
    assertType(toolbarProps, {} as BaseComponentTypes.BaseToolbarProps);
  });
});

export {}; // This export is needed to make the file a module
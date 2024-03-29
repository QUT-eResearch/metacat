// InvalidCatalogEntryException.java - Bad Catalog entry type
// Written by Norman Walsh, nwalsh@arbortext.com
// NO WARRANTY! This class is in the public domain.
package com.arbortext.catalog;

/**
 * <p>Signal bad Catalog entry type</p>
 *
 * <blockquote>
 * <em>This module, both source code and documentation, is in the
 * Public Domain, and comes with <strong>NO WARRANTY</strong>.</em>
 * </blockquote>
 *
 * <p>This exception is thrown if an attempt is made to create
 * a CatalogEntry instance using an invalid entry type.</p>
 */
public class InvalidCatalogEntryTypeException extends Exception {
    public InvalidCatalogEntryTypeException() { super(); }
}

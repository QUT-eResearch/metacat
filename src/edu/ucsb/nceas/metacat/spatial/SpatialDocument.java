/**
 *  '$RCSfile$'
 *  Copyright: 2003 Regents of the University of California.
 *
 * Author: Matthew Perry 
 * '$Date: 2009-08-25 07:34:17 +1000 (Tue, 25 Aug 2009) $'
 * '$Revision: 5030 $'
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */
package edu.ucsb.nceas.metacat.spatial;

import java.io.File;

import edu.ucsb.nceas.metacat.database.DBConnection;
import edu.ucsb.nceas.metacat.properties.PropertyService;
import edu.ucsb.nceas.metacat.util.MetacatUtil;
import edu.ucsb.nceas.metacat.util.SystemUtil;
import edu.ucsb.nceas.utilities.PropertyNotFoundException;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Point;
import com.vividsolutions.jts.geom.Polygon;
import com.vividsolutions.jts.geom.MultiPolygon;
import com.vividsolutions.jts.geom.MultiPoint;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.PrecisionModel;

import org.geotools.feature.AttributeType;
import org.geotools.feature.AttributeTypeFactory;
import org.geotools.feature.Feature;
import org.geotools.feature.FeatureType;
import org.geotools.feature.FeatureTypeFactory;
import org.geotools.feature.SchemaException;

import java.sql.ResultSet;
import java.sql.PreparedStatement;
import java.util.Vector;

import org.apache.log4j.Logger;

/**
 * 
 * Class representing the spatial portions of an xml document as a geotools
 * Feature.
 */
public class SpatialDocument {

	private DBConnection dbconn;

	private static Logger log = Logger.getLogger(SpatialDocument.class.getName());

	private SpatialFeatureSchema featureSchema = new SpatialFeatureSchema();

	Vector west = new Vector();
	Vector south = new Vector();
	Vector east = new Vector();
	Vector north = new Vector();

	String title = "";
	String docid = null;

	/**
	 * Constructor that queries the db
	 * 
	 * @param docid
	 *            The document id to be represented spatially
	 * @param dbconn
	 *            The database connection shared from the refering method.
	 */
	public SpatialDocument(String docid, DBConnection dbconn) {

		this.docid = docid;
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		this.dbconn = dbconn;
		boolean isSpatialDocument = false;
		String thisDocname = null;
		String westPath = null;
		String eastPath = null;
		String northPath = null;
		String southPath = null;

		/*
		 * Determine the docname/schema and decide how to proceed with spatial
		 * harvest
		 */
		String query = "SELECT docname FROM xml_documents WHERE docid='" + docid.trim()
				+ "';";
		String docname = "";
		try {
			pstmt = dbconn.prepareStatement(query);
			pstmt.execute();
			rs = pstmt.getResultSet();
			while (rs.next()) {
				docname = rs.getString(1);
			}
			rs.close();
			pstmt.close();
		} catch (Exception e) {
			log.error(" ---- Could not get docname for " + docid);
			e.printStackTrace();
		}
		if (docname == null)
			docname = "";

		// Loop through all our spatial docnames and determine if the current
		// document matches
		// If so, get the appropriate corner xpaths
		try {
			Vector spatialDocnames = MetacatUtil.getOptionList(PropertyService
					.getProperty("spatial.spatialDocnameList"));
			for (int i = 0; i < spatialDocnames.size(); i++) {
				thisDocname = ((String) spatialDocnames.elementAt(i)).trim();
				if (docname.trim().equals(thisDocname)) {
					isSpatialDocument = true;

					// determine its east,west,north and south coord xpaths
					westPath = PropertyService.getProperty("spatial." + thisDocname
							+ "_westBoundingCoordinatePath");
					eastPath = PropertyService.getProperty("spatial." + thisDocname
							+ "_eastBoundingCoordinatePath");
					northPath = PropertyService.getProperty("spatial." + thisDocname
							+ "_northBoundingCoordinatePath");
					southPath = PropertyService.getProperty("spatial." + thisDocname
							+ "_southBoundingCoordinatePath");
				}
			}
		} catch (PropertyNotFoundException pnfe) {
			log.error("Could not find spatialDocnameList or bounding coordinate "
					+ "path for: " + docid);
			pnfe.printStackTrace();
		}

		// If it is a spatial document, harvest the corners and title
		if (isSpatialDocument) {

			/*
			 * Get the bounding coordinates
			 */
			query = "SELECT path, nodedatanumerical, parentnodeid FROM xml_path_index"
					+ " WHERE docid = '"
					+ docid.trim()
					+ "'"
					+ " AND docid IN (SELECT distinct docid FROM xml_access WHERE docid = '"
					+ docid.trim()
					+ "' AND principal_name = 'public' AND perm_type = 'allow')"
					+ " AND (path = '" + westPath + "'" + "  OR path = '" + southPath
					+ "'" + "  OR path = '" + eastPath + "'" + "  OR path = '"
					+ northPath + "'" + " ) ORDER BY parentnodeid;";

			try {
				pstmt = dbconn.prepareStatement(query);
				pstmt.execute();
				rs = pstmt.getResultSet();
				while (rs.next()) {
					if (rs.getString(1).equals(westPath))
						this.west.add(new Float(rs.getFloat(2)));
					else if (rs.getString(1).equals(southPath))
						this.south.add(new Float(rs.getFloat(2)));
					else if (rs.getString(1).equals(eastPath))
						this.east.add(new Float(rs.getFloat(2)));
					else if (rs.getString(1).equals(northPath))
						this.north.add(new Float(rs.getFloat(2)));
					else
						log.error("** An xml path not related to your bounding coordinates was returned by this query \n"
										+ query + "\n");
				}
				rs.close();
				pstmt.close();
			} catch (Exception e) {
				log.error(" ---- Could not get bounding coordinates for " + docid);
				e.printStackTrace();
			}

			/*
			 * Get the title
			 */

			try {

				String docTitlePath = PropertyService.getProperty("spatial.docTitle");
				query = "select nodedata from xml_path_index where path = '"
						+ docTitlePath.trim() + "' and docid = '" + docid.trim() + "'";
				pstmt = dbconn.prepareStatement(query);
				pstmt.execute();
				rs = pstmt.getResultSet();
				if (rs.next())
					this.title = rs.getString(1);
				rs.close();
				pstmt.close();
			} catch (Exception e) {
				log.error(" **** Error getting docids from getTitle for docid = "
								+ docid);
				e.printStackTrace();
				this.title = docid;
			}
		}

  }

  /**
	 * Returns a geotools (multi)polygon feature with geometry plus attributes
	 * ready to be inserted into our spatial dataset cache
	 */
  public Feature getPolygonFeature() {
      // Get polygon feature type
      FeatureType polyType = featureSchema.getPolygonFeatureType();

      MultiPolygon theGeom = getPolygonGeometry();
      if (theGeom == null)
          return null;

      // Populate the feature schema
      try {
          Feature polyFeature = polyType.create(new Object[]{ 
              theGeom,
              this.docid,
              getUrl(this.docid), 
              this.title });
          return polyFeature; 
      } catch (org.geotools.feature.IllegalAttributeException e) {
          log.error("!!!!!!! org.geotools.feature.IllegalAttributeException");
          return null;
      }
  }

  /**
   * Returns a geotools (multi)point feature with geometry plus attributes
   * ready to be inserted into our spatial dataset cache
   *
   */
  public Feature getPointFeature() {
      // Get polygon feature type
      FeatureType pointType = featureSchema.getPointFeatureType();

      MultiPoint theGeom = getPointGeometry();
      if (theGeom == null)
          return null;

      // Populate the feature schema
      try {
          Feature pointFeature = pointType.create(new Object[]{ 
              theGeom,
              this.docid,
              getUrl(this.docid), 
              this.title });
          return pointFeature;
      } catch (org.geotools.feature.IllegalAttributeException e) {
          log.error("!!!!!!! org.geotools.feature.IllegalAttributeException");
          return null;
      }
  }

  /**
   * Given a valid docid, return an appropriate URL
   * for viewing the metadata document
   *
   * @param docid The document id for which to construct the access url.
   */
  private String getUrl( String docid ) {
     String docUrl = null;
     try {
    	 docUrl = SystemUtil.getServletURL()
                    + "?action=read&docid=" + docid 
                    + "&qformat=" 
                    + PropertyService.getProperty("application.default-style");
     } catch (PropertyNotFoundException pnfe) {
    	 log.error("Could not get access url because of unavailable property: " 
    			 + pnfe.getMessage());
     }

     return docUrl;
  }


  /**
   * Returns a mutlipolygon geometry representing the geographic coverage(s) of the document
   *
   */
  private MultiPolygon getPolygonGeometry() {

    PrecisionModel precModel = new PrecisionModel(); // default: Floating point
    GeometryFactory geomFac = new GeometryFactory( precModel, featureSchema.srid );
    Vector polygons = new Vector();
    float w;
    float s;
    float e;
    float n;

    if ( west.size() == south.size() && south.size() == east.size() && east.size() == north.size() ) {
        for (int i = 0; i < west.size(); i++) {

            w = ((Float)west.elementAt(i)).floatValue();
            s = ((Float)south.elementAt(i)).floatValue();
            e = ((Float)east.elementAt(i)).floatValue();
            n = ((Float)north.elementAt(i)).floatValue();

            // Check if it's actually a valid polygon
            if (  w == 0.0 && s == 0.0 && e == 0.0 && n == 0.0) {
                log.warn("        Invalid or empty coodinates ... skipping");
                continue;
            } else if( Float.compare(w, e) == 0 && Float.compare(n,s) == 0 ) {
                log.warn("        Point coordinates only.. skipping polygon generation");
                continue;
            }

            // Handle the case of crossing the dateline and poles
            // dateline crossing is valid 
            // polar crossing is not ( so we swap north and south )
            // Assumes all coordinates are confined to -180 -90 180 90
            float dl = 180.0f;
            float _dl = -180.0f;
            
            if ( w > e && s > n ) {
                log.info( "Crosses both the dateline and the poles .. split into 2 polygons, swap n & s" );
                polygons.add( createPolygonFromBbox( geomFac,   w,   n, dl, s ) );
                polygons.add( createPolygonFromBbox( geomFac, _dl,   n,  e, s ) );
            } else if ( w > e ) {
                log.info( "Crosses the dateline .. split into 2 polygons" );
                polygons.add( createPolygonFromBbox( geomFac,   w, s, dl, n ) );
                polygons.add( createPolygonFromBbox( geomFac, _dl, s,  e, n ) );
            } else if ( s > n ) {
                log.info( "Crosses the poles .. swap north and south" );
                polygons.add( createPolygonFromBbox( geomFac, w, n, e, s ) );
            } else {
                // Just a standard polygon that fits nicely onto our flat earth
                polygons.add( createPolygonFromBbox( geomFac, w, s, e, n ) );    
            }

             
        }
    } else {
       log.error(" *** Something went wrong.. your east,west,north and south bounding arrays are different sizes!");
    }
    
    if( polygons.size() > 0 ) {
       Polygon[] polyArray = geomFac.toPolygonArray( polygons );
       MultiPolygon multiPolyGeom= geomFac.createMultiPolygon( polyArray );
       return multiPolyGeom; 
    } else {
       return null;
    } 

  }
   

  /**
   * Returns a polygon given the four bounding box coordinates
   */
  private Polygon createPolygonFromBbox( GeometryFactory geomFac, float w, float s, float e, float n ) {

        Coordinate[] linestringCoordinates = new Coordinate[5];

        linestringCoordinates[0] = new Coordinate( w, s );
        linestringCoordinates[1] = new Coordinate( w, n );
        linestringCoordinates[2] = new Coordinate( e, n );
        linestringCoordinates[3] = new Coordinate( e, s );
        linestringCoordinates[4] = new Coordinate( w, s );

        return geomFac.createPolygon( geomFac.createLinearRing(linestringCoordinates), null);
  }


  /**
   * Returns a multipoint geometry represnting the geographic coverage(s) of the document
   *
   * @todo Handle the case of crossing the dateline and poles
   */
  private MultiPoint getPointGeometry() {

    PrecisionModel precModel = new PrecisionModel(); // default: Floating point
    GeometryFactory geomFac = new GeometryFactory( precModel, featureSchema.srid );
    float w;
    float s;
    float e;
    float n;

    PreparedStatement pstmt = null;
    ResultSet rs = null;

    Vector points = new Vector();

    if ( west.size() == south.size() && south.size() == east.size() && east.size() == north.size() ) {
        for (int i = 0; i < west.size(); i++) {

            w = ((Float)west.elementAt(i)).floatValue();
            s = ((Float)south.elementAt(i)).floatValue();
            e = ((Float)east.elementAt(i)).floatValue();
            n = ((Float)north.elementAt(i)).floatValue();

            // Check if it's actually a valid point
            if (  w == 0.0f && s == 0.0f && e == 0.0f && n == 0.0f) {
                 log.warn("        Invalid or empty coodinates ... skipping");
                 continue;
            }

            float xCenter;
            float yCenter;

            // Handle the case of crossing the dateline and poles
            // Assumes all coordinates are confined to -180 -90 180 90

            if ( w > e ) {
                log.info( "Crosses the dateline .. " );
                xCenter = (360.0f - w + e)/ 2.0f + w;
                if( xCenter > 180.0f )
                    xCenter = xCenter - 360.0f;
                yCenter = ( s + n ) / 2.0f;
            } else {
                // Just a standard point that can be calculated by the average coordinates
                xCenter = ( w + e ) / 2.0f;
                yCenter = ( s + n ) / 2.0f;
            }

            points.add( geomFac.createPoint( new Coordinate( xCenter, yCenter)) );
        }
    } else {
       log.error(" *** Something went wrong.. your east,west,north and south bounding vectors are different sizes!");
    }
    
    if( points.size() > 0 ) {
       Point[] pointArray = geomFac.toPointArray( points );
       MultiPoint multiPointGeom= geomFac.createMultiPoint( pointArray );
       return multiPointGeom; 
    } else {
       return null;
    } 


  }
}

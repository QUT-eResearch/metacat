<?xml version="1.0"?>
<!--
  *  '$RCSfile$'
  *      Authors: Matthew Brooke
  *    Copyright: 2000 Regents of the University of California and the
  *               National Center for Ecological Analysis and Synthesis
  *  For Details: http://www.nceas.ucsb.edu/
  *
  *   '$Author: cjones $'
  *     '$Date: 2006-11-18 07:37:07 +1000 (Sat, 18 Nov 2006) $'
  * '$Revision: 3094 $'
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
  *
  * This is an XSLT (http://www.w3.org/TR/xslt) stylesheet designed to
  * convert an XML file that is valid with respect to the eml-variable.dtd
  * module of the Ecological Metadata Language (EML) into an HTML format
  * suitable for rendering with modern web browsers.
-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

  <xsl:output method="html" encoding="iso-8859-1"
    doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
    doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
    indent="yes" />  
    
    <!-- style the identifier and system -->
    <xsl:template name="identifier">
      <xsl:param name="IDfirstColStyle"/>
      <xsl:param name="IDsecondColStyle"/>
      <xsl:param name="packageID"/>
      <xsl:param name="system"/>
      <xsl:if test="normalize-space(.)">
        <tr>
          <td class="{$IDfirstColStyle}">Identifier:</td>
          <td class="{$IDsecondColStyle}"><xsl:value-of select="$packageID"/>
          <xsl:if test="normalize-space(../@system)!=''">
            <xsl:text> (in the </xsl:text>
            <em class="italic">
              <xsl:value-of select="$system"/>
            </em>
            <xsl:text> Catalog System)</xsl:text>
          </xsl:if>
          </td>
        </tr>
      </xsl:if>
    </xsl:template>
    
 </xsl:stylesheet>

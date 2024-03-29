<?xml version="1.0"?>
<!DOCTYPE html [
  <!ENTITY inchead SYSTEM "include_head.jsp">
  <!ENTITY incheader SYSTEM "include_header.jsp">
  <!ENTITY incside SYSTEM "include_side.jsp">
  <!ENTITY incfooter SYSTEM "include_footer.jsp">
  <!ENTITY incsearchbox SYSTEM "include_searchbox.jsp">
  <!ENTITY nbsp "&#160;">
]>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:output method="html" doctype-system="about:legacy-compat" encoding="utf-8" indent="yes" />
  <xsl:param name="sessid"/>
  <xsl:param name="qformat">n2o</xsl:param>
  <xsl:param name="enableediting">false</xsl:param>
  <xsl:param name="contextURL"/>
  <xsl:param name="cgi-prefix"/>

  <xsl:template match="/">
    <html>
      <head>
        <title>N2O Repository</title>
        <meta name="DC.Title" content="N2O Repository"/>
        &inchead;
      </head>
      <body>
        <div class="centerContainer">
          &incheader;
          <div class="mainContent">
            &incside;
            <div class="contentColumn left">
              &incsearchbox;
              <div id="searchResultArea" class="moduleArea roundedBorders bgWhiteAlpha90">
                <div class="moduleContent">
                <p class="emphasis">
                  <xsl:number value="count(resultset/document)" /> data packages found
                </p>
    <!-- This tests to see if there are returned documents, if there are not then don't show the query results -->
    <xsl:if test="count(resultset/document) &gt; 0">
      <table class="resultstable" width="100%" align="center" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <th class="tablehead"> Title </th>
          <th class="tablehead" width="15%"> Contacts </th>
          <th class="tablehead" width="15%"> Organisation </th>
          <th class="tablehead" width="15%"> Keywords </th>
          
          <xsl:if test="$enableediting = 'true'">
            <th class="tablehead" width="10%" style="text-align: middle"> Actions </th>
          </xsl:if>
        </tr>

        <xsl:for-each select="resultset/document">
          <xsl:sort select="./param[@name='dataset/title']" />
            <tr valign="top" class="subpanel">
              <xsl:attribute name="class">
                <xsl:choose>
                  <xsl:when test="position() mod 2 = 1">
                    rowodd
                  </xsl:when>
                  <xsl:when test="position() mod 2 = 0">
                    roweven
                  </xsl:when>
                </xsl:choose>
              </xsl:attribute>
              
              <td class="text_plain">
                <form action="metacat" method="POST">
                  <xsl:attribute name="name"><xsl:value-of select="translate(./docid, '()-.', '____')" /></xsl:attribute>
                  <input type="hidden" name="qformat" value="{$qformat}" />
                  <input type="hidden" name="sessionid" value="{$sessid}" />
                  <xsl:if test="$enableediting = 'true'">
                    <input type="hidden" name="enableediting" value="{$enableediting}" />
                  </xsl:if>
                  <input type="hidden" name="action" value="read" />
                  <input type="hidden" name="docid">
                    <xsl:attribute name="value">
                      <xsl:value-of select="./docid" />
                    </xsl:attribute>
                  </input>
                  <xsl:for-each select="./relation">
                    <input type="hidden" name="docid">
                      <xsl:attribute name="value">
                        <xsl:value-of select="./relationdoc" />
                      </xsl:attribute>
                    </input>
                  </xsl:for-each>
                  <a>
                    <xsl:attribute name="href">javascript:document.<xsl:value-of select="translate(./docid, '()-.', '____')"/>.submit()</xsl:attribute>
                    <xsl:text>
                        &#187;&#160;
                    </xsl:text>
                    <xsl:choose>
                      <xsl:when test="./param[@name='dataset/title']!=''"><xsl:value-of select="./param[@name='dataset/title']" /> </xsl:when>
                      <xsl:otherwise>
                          <xsl:value-of select="./param[@name='citation/title']" />
                          <xsl:value-of select="./param[@name='software/title']" />
                          <xsl:value-of select="./param[@name='protocol/title']" />
                          <xsl:value-of select="./param[@name='idinfo/citation/citeinfo/title']" />
                      </xsl:otherwise>
                    </xsl:choose>
                  </a>
                  <br />
                  <pre>ID: <xsl:value-of select="./docid" /><br/>Last updated: <xsl:value-of select="./updatedate" /></pre>
                </form>
              </td>
              
              <td class="text_plain">
                  <xsl:for-each
                      select="./param[@name='originator/individualName/surName']">
                      <xsl:value-of select="." />
                      <br />
                  </xsl:for-each>
                  <xsl:for-each
                      select="./param[@name='creator/individualName/surName']">
                      <xsl:value-of select="." />
                      <br />
                  </xsl:for-each>
                  <xsl:for-each
                      select="./param[@name='idinfo/citation/citeinfo/origin']">
                      <xsl:value-of select="." />
                      <br />
                  </xsl:for-each>
                  
              </td>
              <td class="text_plain">
                  <xsl:value-of
                      select="./param[@name='originator/organizationName']" />
                  <xsl:value-of
                      select="./param[@name='creator/organizationName']" />
                  
              </td>
              
              <td class="text_plain">
                  <xsl:for-each
                      select="./param[@name='keyword']">
                      <xsl:value-of select="." />
                      <br />
                  </xsl:for-each>
                  <xsl:for-each
                      select="./param[@name='idinfo/keywords/theme/themekey']">
                      <xsl:value-of select="." />
                      <br />
                  </xsl:for-each>
                  
              </td>
              
              <xsl:if test="$enableediting = 'true'">
                  <td class="text_plain">
                      <form action="{$contextURL}/metacat" method="POST">
                          <input type="hidden" name="action" value="read" />
                          <input type="hidden" name="qformat" value="{$qformat}" />
                          <input type="hidden" name="sessionid" value="{$sessid}" />
                          <input type="hidden" name="docid">
                              <xsl:attribute name="value">
                                  <xsl:value-of select="./docid" />
                              </xsl:attribute>
                          </input>
                          <center>
                              <input type="SUBMIT" value=" View " name="View">
                              </input>
                          </center>
                      </form>
                      <form action="{$cgi-prefix}/register-dataset.cgi" method="POST">
                          <input type="hidden" name="stage" value="modify" />
                          <input type="hidden" name="cfg" value="{$qformat}" />
                          <input type="hidden" name="sessionid" value="{$sessid}" />
                          <input type="hidden" name="docid">
                              <xsl:attribute name="value">
                                  <xsl:value-of select="./docid" />
                              </xsl:attribute>
                          </input>
                          <center>
                              <input type="SUBMIT" value=" Edit " name="Edit">
                              </input>
                          </center>
                      </form>
                      <form action="{$cgi-prefix}/register-dataset.cgi" method="POST">
                          <input type="hidden" name="stage" value="delete" />
                          <input type="hidden" name="cfg" value="{$qformat}" />
                          <input type="hidden" name="sessionid" value="{$sessid}" />
                          <input type="hidden" name="docid">
                              <xsl:attribute name="value">
                                  <xsl:value-of select="./docid" />
                              </xsl:attribute>
                          </input>
                          <center>
                              <input type="SUBMIT" value="Delete" name="Delete">
                              </input>
                          </center>
                      </form>
                  </td>
              </xsl:if>
          </tr>
        </xsl:for-each>
      </table>
    </xsl:if>
                </div> <!--moduleContent-->
              </div> <!--searchResultArea-->
            </div> <!-- contentColumn -->
          </div> <!-- mainContent -->
          &incfooter;
        </div> <!-- centerContainer -->
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>

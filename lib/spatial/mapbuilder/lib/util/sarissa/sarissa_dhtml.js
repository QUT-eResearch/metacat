/**
 * ====================================================================
 * About
 * ====================================================================
 * Sarissa cross browser XML library - AJAX module
 * @version 0.9.7.6
 * @author: Copyright Manos Batsis, mailto: mbatsis at users full stop sourceforge full stop net
 *
 * This module contains some convinient AJAX tricks based on Sarissa 
 *
 * ====================================================================
 * Licence
 * ====================================================================
 * Sarissa is free software distributed under the GNU GPL version 2 (see <a href="gpl.txt">gpl.txt</a>) or higher, 
 * GNU LGPL version 2.1 (see <a href="lgpl.txt">lgpl.txt</a>) or higher and Apache Software License 2.0 or higher 
 * (see <a href="asl.txt">asl.txt</a>). This means you can choose one of the three and use that if you like. If 
 * you make modifications under the ASL, i would appreciate it if you submitted those.
 * In case your copy of Sarissa does not include the license texts, you may find
 * them online in various formats at <a href="http://www.gnu.org">http://www.gnu.org</a> and 
 * <a href="http://www.apache.org">http://www.apache.org</a>.
 *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY 
  * KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE 
  * WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE 
  * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
  * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
  * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
  * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/** @private */
Sarissa.updateCursor = function(oTargetElement, sValue) {
    if(oTargetElement && oTargetElement.style && oTargetElement.style.cursor != undefined ){
        oTargetElement.style.cursor = sValue;
    };
};

/**
 * Update an element with response of a GET request on the given URL.  Passing a configured XSLT 
 * processor will result in transforming and updating oNode before using it to update oTargetElement.
 * You can also pass a callback function to be executed when the update is finished. The function will be called as 
 * <code>functionName(oNode, oTargetElement);</code>
 * @addon
 * @param sFromUrl the URL to make the request to
 * @param oTargetElement the element to update
 * @param xsltproc (optional) the transformer to use on the returned
 *                  content before updating the target element with it
 * @param callback (optional) a Function object to execute once the update is finished successfuly, called as <code>callback(oNode, oTargetElement)</code>
 * @param skipCache (optional) whether to skip any cache
 */
Sarissa.updateContentFromURI = function(sFromUrl, oTargetElement, xsltproc, callback, skipCache) {
    try{
        Sarissa.updateCursor(oTargetElement, "wait");
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", sFromUrl);
        function sarissa_dhtml_loadHandler() {
            if (xmlhttp.readyState == 4) {
                Sarissa.updateContentFromNode(xmlhttp.responseXML, oTargetElement, xsltproc, callback);
            };
        };
        xmlhttp.onreadystatechange = sarissa_dhtml_loadHandler;
        if (skipCache) {
             var oldage = "Sat, 1 Jan 2000 00:00:00 GMT";
             xmlhttp.setRequestHeader("If-Modified-Since", oldage);
        };
        xmlhttp.send("");
    }
    catch(e){
        Sarissa.updateCursor(oTargetElement, "auto");
        throw e;
    };
};

/**
 * Update an element's content with the given DOM node. Passing a configured XSLT 
 * processor will result in transforming and updating oNode before using it to update oTargetElement.
 * You can also pass a callback function to be executed when the update is finished. The function will be called as 
 * <code>functionName(oNode, oTargetElement);</code>
 * @addon
 * @param oNode the URL to make the request to
 * @param oTargetElement the element to update
 * @param xsltproc (optional) the transformer to use on the given 
 *                  DOM node before updating the target element with it
 * @param callback (optional) a Function object to execute once the update is finished successfuly, called as <code>callback(oNode, oTargetElement)</code>
 */
Sarissa.updateContentFromNode = function(oNode, oTargetElement, xsltproc, callback) {
    try {
        Sarissa.updateCursor(oTargetElement, "wait");
        Sarissa.clearChildNodes(oTargetElement);
        // check for parsing errors
        var ownerDoc = oNode.nodeType == Node.DOCUMENT_NODE?oNode:oNode.ownerDocument;
        if(ownerDoc.parseError && ownerDoc.parseError != 0) {
            var pre = document.createElement("pre");
            pre.appendChild(document.createTextNode(Sarissa.getParseErrorText(ownerDoc)));
            oTargetElement.appendChild(pre);
        }
        else {
            // transform if appropriate
            if(xsltproc) {
                oNode = xsltproc.transformToDocument(oNode);
            };
            // be smart, maybe the user wants to display the source instead
            if(oTargetElement.tagName.toLowerCase() == "textarea" || oTargetElement.tagName.toLowerCase() == "input") {
                oTargetElement.value = new XMLSerializer().serializeToString(oNode);
            }
            else {
                // ok that was not smart; it was paranoid. Keep up the good work by trying to use DOM instead of innerHTML
                if(oNode.nodeType == Node.DOCUMENT_NODE || oNode.ownerDocument.documentElement == oNode) {
                    oTargetElement.innerHTML = new XMLSerializer().serializeToString(oNode);
                }
                else{
                    oTargetElement.appendChild(oTargetElement.ownerDocument.importNode(oNode, true));
                };
            };  
        };
        if (callback) {
            callback(oNode, oTargetElement);
        };
    }
    catch(e) {
            throw e;
    }
    finally{
        Sarissa.updateCursor(oTargetElement, "auto");
    };
};


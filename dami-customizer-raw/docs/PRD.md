PRD: Serverless Shopify Embroidery Personalizer & Local Production CLI
1. Project Overview
Goal: Build a custom product personalization engine for an embroidery business on Shopify, with zero external cloud hosting costs.
Architecture: 1.  A React + Fabric.js frontend injected into the Shopify Dawn theme to provide a drag-and-drop user experience, passing layout data to the cart.
2.  A local Node.js (or Python) CLI script run on the shop owner's computer that pulls order data via the Shopify Admin API and automatically generates high-resolution composite images for the embroidery machines.

2. Tech Stack Definitions
Storefront Theme: Shopify Dawn (Latest Version).

Frontend Injectable: React, Fabric.js, Vite (configured to build a single customizer-bundle.js file to host in Shopify Assets).

Data Storage (Icons): Shopify Metaobjects (to allow the admin to upload new embroidery PNGs natively in Shopify).

Local Production Script: Node.js (with node-canvas and @shopify/shopify-api) OR Python (with Pillow and requests).

3. Data Flow & Coordinate System (CRITICAL)
To ensure the design generated on the local machine matches exactly what the customer saw on their screen, absolute pixels must not be used on the frontend.

Coordinate Standard: All frontend coordinates passed to the cart must be relative percentages (e.g., 0.0 to 1.0) based on the center of the defined "Print Area Bounding Box."

Scale Standard: Scale must be passed as a multiplier (e.g., 1.0 = native digitizer size, 0.8 = 80% size).

Scale Locking: Free-form scaling must be disabled or strictly constrained to specific discrete increments to protect embroidery stitch density.

4. Phase 1: Frontend Development (React + Fabric.js)
4.1. Core Components
ProductPageWrapper: Mounts onto a target div in the main-product.liquid section. Reads the current Shopify Product JSON.

TabSystem: Toggles between standard Shopify images and the CanvasEditor.

CanvasEditor: The Fabric.js instance.

Loads the active product variant's base image.

Draws an invisible bounding box (clipPath or constrained movement logic) representing the safe embroiderable area.

DesignSelector: A UI grid fetching available embroidery designs dynamically from Shopify Metaobjects.

4.2. Business Logic Constraints
Bounding Box Containment: Implement Fabric.js event listeners (object:moving) to force the active design to remain entirely within the predefined coordinates of the safe area.

Item Limits: Define max designs per item (e.g., Max 1 for Key Charm, Max 3 for Apron).

4.3. Shopify Cart Integration
Intercept the Shopify form[action="/cart/add"] submission.

Calculate the final relative parameters (X%, Y%, Scale) of the design inside the bounding box.

Construct the Line Item Properties JSON string and execute an AJAX POST /cart/add.js.

Frontend-to-Cart Payload Standard:

JSON
{
  "id": 1234567890, 
  "quantity": 1,
  "properties": {
    "_customizer_data": "{ \"design_name\": \"floral_01\", \"design_url\": \"https://cdn.shopify.com/...png\", \"x_percent\": 0.45, \"y_percent\": 0.60, \"scale\": 1.0, \"base_variant_sku\": \"TOTE-BLK-L\" }"
  }
}
5. Phase 2: Local CLI Production Generator
5.1. Script Purpose
A standalone command-line script run locally by the shop owner to fetch new orders and generate exact visual layouts for the embroidery process.

5.2. Data Ingestion
Authenticate using a Shopify Custom App Admin API Access Token.

Query the Shopify GraphQL or REST API for all unfulfilled orders.

Filter for orders containing line items with the _customizer_data property.

5.3. Image Generation Logic (e.g., node-canvas)
For each valid line item:

Load the high-res blank product image matching the base_variant_sku (stored in a local directory, e.g., ./assets/blanks/).

Download the transparent design PNG from the design_url provided in the cart data.

Initialize a canvas matching the high-res blank dimensions.

Draw the blank product.

Calculate absolute pixels: Map the relative x_percent and y_percent from the order data to the absolute pixel bounding box predefined in a local config file for that specific SKU.

Draw the design PNG at the calculated coordinates and scale.

5.4. File Output & Order Management
Export the composite canvas to a local folder structured by date or order number (e.g., ./output/Order-1004/Tote-Black-Layout.png).

(Optional) Send an API request back to Shopify to add an Order Tag (e.g., File_Generated) so the script ignores it on the next run.

6. AI Implementation Roadmap for Claude Code
Agent Instructions for Execution:

Step 1: Initialize a local Node.js environment. Write the CLI script (generate-files.js) using @shopify/shopify-api to successfully fetch order data from a Shopify development store.

Step 2: Implement the local image generation function using node-canvas. Pass mock relative coordinates and verify the output PNG places the design correctly on a high-res base image.

Step 3: Switch to the Shopify frontend. Initialize a Vite + React project. Configure Vite to compile into a single customizer-bundle.js file with bundled CSS.

Step 4: Build the Fabric.js CanvasEditor component. Implement the relative percentage coordinate math, bounding box containment, and scale-locking.

Step 5: Write the Shopify AJAX Cart interception script to bundle the Fabric.js state into the hidden _customizer_data line item property.

Step 6: Run an end-to-end test on the Development Store: Add an item to the cart via the visualizer, complete checkout, run the local CLI script, and verify the resulting image matches the frontend UI.
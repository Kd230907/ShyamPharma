/* =====================================================
   SHYAM PHARMA
   SUPABASE CONFIGURATION

   Both values below are safe to commit and safe to
   ship to the browser. The key is a PUBLIC key - it
   only ever grants what the Row Level Security
   policies in supabase/migrations allow.

   Never put the service_role key in this file.
   That key bypasses RLS entirely.
   ===================================================== */


const SUPABASE_URL =
    "https://vzsapmvswigriymgalnz.supabase.co";


/* =====================================================
   PASTE YOUR PUBLIC KEY HERE

   Supabase dashboard
       -> Project Settings
       -> API Keys

   Copy either the "anon / public" key or the newer
   "publishable" key. Both work.
   ===================================================== */

const SUPABASE_ANON_KEY =
    "sb_publishable_MNogqcXzQdj37tfOvvjt1Q_fSlD6gJ7";


/* =====================================================
   STORAGE BUCKET FOR PRODUCT IMAGES
   ===================================================== */

const SUPABASE_IMAGE_BUCKET =
    "product-images";


/* =====================================================
   IMAGE COMPRESSION

   Photos are compressed in the browser before they are
   uploaded, so a 4 MB phone camera picture does not
   consume 4 MB of the storage quota.

   IMAGE_MAX_DIMENSION
       The longest edge, in pixels. Anything larger is
       scaled down proportionally. The website never
       displays a product image larger than roughly
       360px, so 1200 still leaves plenty of headroom
       for high density screens.

   IMAGE_QUALITY
       0 to 1. Below about 0.7 compression artefacts
       start to show on product packaging text.
   ===================================================== */

const IMAGE_MAX_DIMENSION = 1200;

const IMAGE_QUALITY = 0.82;

/* =====================================================
   SHYAM PHARMA - INITIAL SCHEMA

   Creates the products table, the site settings table,
   the product image storage bucket, and the Row Level
   Security policies that protect all of them.
   ===================================================== */


/* =====================================================
   PRODUCTS
   ===================================================== */

create table if not exists public.products (

    id            bigint generated always as identity primary key,

    product_name  text        not null,
    category      text        not null default '',
    composition   text        not null default '',

    mrp           numeric(10, 2) not null default 0,
    rate          numeric(10, 2) not null default 0,

    pack_size     text        not null default '',
    manufacturer  text        not null default '',
    description   text        not null default '',

    image_url     text        not null default '',

    status        text        not null default 'Out of Stock'
                  check (status in ('Available', 'Out of Stock')),

    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()

);


create index if not exists products_category_idx
    on public.products (category);

create index if not exists products_created_at_idx
    on public.products (created_at desc);


/* =====================================================
   KEEP updated_at CURRENT
   ===================================================== */

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin

    new.updated_at = now();

    return new;

end;
$$;


drop trigger if exists products_touch_updated_at on public.products;

create trigger products_touch_updated_at
    before update on public.products
    for each row
    execute function public.touch_updated_at();


/* =====================================================
   PRODUCTS - ROW LEVEL SECURITY

   The anon key ships to every visitor's browser, so
   these policies are the only thing standing between
   the public and the product catalogue. Everyone may
   read. Only a signed-in admin may write.
   ===================================================== */

alter table public.products enable row level security;


drop policy if exists "Products are publicly readable" on public.products;

create policy "Products are publicly readable"
    on public.products
    for select
    to anon, authenticated
    using (true);


drop policy if exists "Authenticated users can insert products" on public.products;

create policy "Authenticated users can insert products"
    on public.products
    for insert
    to authenticated
    with check (true);


drop policy if exists "Authenticated users can update products" on public.products;

create policy "Authenticated users can update products"
    on public.products
    for update
    to authenticated
    using (true)
    with check (true);


drop policy if exists "Authenticated users can delete products" on public.products;

create policy "Authenticated users can delete products"
    on public.products
    for delete
    to authenticated
    using (true);


/* =====================================================
   SITE SETTINGS

   A single row (id = 1) holding the company details
   and site copy that the dashboard settings panel
   edits. Stored in the database so the settings follow
   the admin across devices instead of living in one
   browser's localStorage.
   ===================================================== */

create table if not exists public.site_settings (

    id              smallint primary key default 1
                    check (id = 1),

    company_name    text not null default 'SHYAM PHARMA DISTRIBUTOR',
    phone           text not null default '94093 01741',
    email           text not null default 'shyampharmadistributor1@gmail.com',
    address         text not null default '',

    website_title   text not null default 'SHYAM PHARMA DISTRIBUTOR',
    tagline         text not null default 'Professional Pharmaceutical Distribution',
    description     text not null default 'Reliable pharmaceutical products and professional distribution services.',

    theme           text not null default 'light'
                    check (theme in ('light', 'dark')),

    updated_at      timestamptz not null default now()

);


insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;


drop trigger if exists site_settings_touch_updated_at on public.site_settings;

create trigger site_settings_touch_updated_at
    before update on public.site_settings
    for each row
    execute function public.touch_updated_at();


alter table public.site_settings enable row level security;


drop policy if exists "Settings are publicly readable" on public.site_settings;

create policy "Settings are publicly readable"
    on public.site_settings
    for select
    to anon, authenticated
    using (true);


drop policy if exists "Authenticated users can update settings" on public.site_settings;

create policy "Authenticated users can update settings"
    on public.site_settings
    for update
    to authenticated
    using (true)
    with check (true);


/* =====================================================
   PRODUCT IMAGE STORAGE

   Images used to be base64 data URIs stored inside the
   row itself. They now live in this bucket and the row
   keeps only the public URL.
   ===================================================== */

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;


drop policy if exists "Product images are publicly readable" on storage.objects;

create policy "Product images are publicly readable"
    on storage.objects
    for select
    to anon, authenticated
    using (bucket_id = 'product-images');


drop policy if exists "Authenticated users can upload product images" on storage.objects;

create policy "Authenticated users can upload product images"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'product-images');


drop policy if exists "Authenticated users can update product images" on storage.objects;

create policy "Authenticated users can update product images"
    on storage.objects
    for update
    to authenticated
    using (bucket_id = 'product-images')
    with check (bucket_id = 'product-images');


drop policy if exists "Authenticated users can delete product images" on storage.objects;

create policy "Authenticated users can delete product images"
    on storage.objects
    for delete
    to authenticated
    using (bucket_id = 'product-images');


/* =====================================================
   SEED PRODUCTS

   The three products that were previously hardcoded in
   script.js and dashboard.html.
   ===================================================== */

insert into public.products (
    product_name,
    category,
    composition,
    mrp,
    rate,
    pack_size,
    manufacturer,
    description,
    status
)
select * from (values

    (
        'AMLODIN-5',
        'tablets',
        'Amlodipine 5 mg',
        200.00,
        150.00,
        '20 x 10 Tablets',
        'SHYAM PHARMA',
        'Amlodipine 5 mg Tablets',
        'Available'
    ),

    (
        'ACECLOFENAC-SP',
        'tablets',
        'Aceclofenac + Paracetamol',
        165.00,
        125.00,
        '10 x 10 Tablets',
        'SHYAM PHARMA',
        'Aceclofenac and Paracetamol Tablets',
        'Available'
    ),

    (
        'VITAMIN SYRUP',
        'syrup',
        'Multivitamin & Multimineral',
        120.00,
        95.00,
        '200 ml',
        'SHYAM PHARMA',
        'Multivitamin and Multimineral Syrup',
        'Available'
    )

) as seed (
    product_name,
    category,
    composition,
    mrp,
    rate,
    pack_size,
    manufacturer,
    description,
    status
)
where not exists (
    select 1 from public.products
);

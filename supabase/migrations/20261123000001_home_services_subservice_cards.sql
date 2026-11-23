update public.site_sections
set content = coalesce(content, '{}'::jsonb) || jsonb_build_object(
  'items', $$[
    {"title":"House & Apartment Moving","categorySlug":"residential-moving","categoryName":"Residential & Personal Moving","subservice":"House & Apartment Moving","badge":"Popular","description":"Local relocations across Nairobi estates and suburbs.","detail":"Residential and personal moving solutions.","image":"/images/slots/svc-residential.webp","isVisible":true},
    {"title":"Packing, Crating & Unpacking","categorySlug":"residential-moving","categoryName":"Residential & Personal Moving","subservice":"Packing, Crating & Unpacking","description":"High-grade wrapping materials, custom crates, and unboxing.","detail":"Residential and personal moving solutions.","image":"/images/slots/svc-residential.webp","isVisible":true},
    {"title":"Office Relocation","categorySlug":"commercial-moving","categoryName":"Commercial & Business Moving","subservice":"Office Relocation","badge":"Popular","description":"Planned corporate transfers with labeled inventory and fast setup.","detail":"Commercial and business moving solutions.","image":"/images/slots/svc-commercial.webp","isVisible":true},
    {"title":"Data Center & Tech Moving","categorySlug":"commercial-moving","categoryName":"Commercial & Business Moving","subservice":"Data Center & Tech Moving","description":"Anti-static packing and secure transport for servers and IT gear.","detail":"Commercial and business moving solutions.","image":"/images/slots/svc-commercial.webp","isVisible":true},
    {"title":"Intra-Nairobi Moving","categorySlug":"scope-and-distance","categoryName":"By Scope & Distance","subservice":"Intra-Nairobi Moving","description":"Same-day local moves across Nairobi neighborhoods.","detail":"Moving by scope and distance.","image":"/images/slots/svc-scope.webp","isVisible":true},
    {"title":"Inter-County / Upcountry Moving","categorySlug":"scope-and-distance","categoryName":"Relocation by Scope & Distance","subservice":"Inter-County / Upcountry Moving","badge":"Popular","description":"Long-distance transit between Kenyan towns.","detail":"Moving by scope and distance.","image":"/images/slots/svc-scope.webp","isVisible":true},
    {"title":"Event Gear & Production Transport","categorySlug":"specialized-logistics","categoryName":"Specialized Logistics & Courier","subservice":"Event Gear & Production Transport","badge":"Popular","description":"Secure movement for sound, lighting, and stage gear.","detail":"Specialized logistics and courier solutions.","image":"/images/slots/svc-specialized.webp","isVisible":true},
    {"title":"Express On-Demand Courier","categorySlug":"specialized-logistics","categoryName":"Specialized Logistics & Courier","subservice":"Express On-Demand Courier","description":"Door-to-door regional package delivery.","detail":"Specialized logistics and courier solutions.","image":"/images/slots/svc-specialized.webp","isVisible":true},
    {"title":"Home Spring Cleaning","categorySlug":"cleaning-services","categoryName":"Professional Cleaning Services","subservice":"Home Spring Cleaning","badge":"Popular","description":"Thorough deep cleaning and sanitization for private homes.","detail":"Professional cleaning solutions.","image":"/images/slots/svc-cleaning.webp","isVisible":true},
    {"title":"Event & After-Party Cleaning","categorySlug":"cleaning-services","categoryName":"Professional Cleaning Services","subservice":"Event & After-Party Cleaning","description":"Post-event cleanup and site restoration.","detail":"Professional cleaning solutions.","image":"/images/slots/svc-cleaning.webp","isVisible":true}
  ]$$::jsonb
)
where section_key = 'home_services';

update public.site_sections
set content = jsonb_set(content, '{items}', (
  select jsonb_agg(
    case
      when item->>'categorySlug' = 'scope-and-distance'
        then jsonb_set(item, '{categoryName}', '"Relocation by Scope & Distance"'::jsonb)
      else item
    end
  )
  from jsonb_array_elements(content->'items') as item
), true)
where section_key = 'home_services';

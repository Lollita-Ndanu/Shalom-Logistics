"""Generate compact Kenya county SVG paths from geoBoundaries ADM1 GeoJSON.

One-off tool. Requires Shapely 2.x available on PYTHONPATH. Download the
geoBoundaries-KEN-ADM1_simplified.geojson file from the source URL in the
project task before running. County feature count/names are validated.
"""
import json
import math
import sys
from pathlib import Path

from shapely.geometry import shape
from shapely.ops import unary_union


EXPECTED = {
    "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu",
    "Garissa", "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho",
    "Kiambu", "Kilifi", "Kirinyaga", "Kisii", "Kisumu", "Kitui",
    "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera",
    "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi",
    "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri",
    "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi",
    "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
}


def path_for_geometry(geometry, project):
    rings = []
    polygons = [geometry] if geometry.geom_type == "Polygon" else list(geometry.geoms)
    for polygon in polygons:
        for ring in [polygon.exterior, *polygon.interiors]:
            points = [project(x, y) for x, y in ring.coords]
            if len(points) < 4:
                continue
            rings.append("M" + "L".join(f"{x:.2f},{y:.2f}" for x, y in points) + "Z")
    return "".join(rings)


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/generate-kenya-counties.py <geojson-file>")
    source = Path(sys.argv[1])
    payload = json.loads(source.read_text(encoding="utf-8"))
    features = payload.get("features", [])
    if len(features) != 47:
        raise SystemExit(f"Expected exactly 47 county features; found {len(features)}")

    counties = {}
    for feature in features:
        props = feature["properties"]
        name = props.get("shapeName", "").strip()
        variants = {
            "Nairobi City": "Nairobi",
            "Elgeyo Marakwet": "Elgeyo-Marakwet",
            "Taita Taveta": "Taita-Taveta",
            "Tharaka": "Tharaka-Nithi",
            "Tharaka Nithi": "Tharaka-Nithi",
        }
        name = variants.get(name, name)
        if name in counties:
            raise SystemExit(f"Duplicate normalized county name: {name}")
        geometry = shape(feature["geometry"]).simplify(0.008, preserve_topology=True)
        counties[name] = geometry

    if set(counties) != EXPECTED:
        raise SystemExit(f"County name validation failed. Missing={sorted(EXPECTED-set(counties))}, extra={sorted(set(counties)-EXPECTED)}")

    all_geometry = unary_union(list(counties.values()))
    min_lon, min_lat, max_lon, max_lat = all_geometry.bounds
    width, height = 600.0, 700.0
    padding = 10.0
    scale = min((width - 2 * padding) / (max_lon - min_lon), (height - 2 * padding) / (max_lat - min_lat))
    draw_width = (max_lon - min_lon) * scale
    draw_height = (max_lat - min_lat) * scale
    offset_x = (width - draw_width) / 2
    offset_y = (height - draw_height) / 2

    def project(lon, lat):
        return offset_x + (lon - min_lon) * scale, height - (offset_y + (lat - min_lat) * scale)

    rows = []
    for name in sorted(counties):
        county_id = name.lower().replace("'", "").replace("-", "-").replace(" ", "-")
        center_x, center_y = project(*counties[name].representative_point().coords[0])
        rows.append({"id": county_id, "name": name, "d": path_for_geometry(counties[name], project), "cx": round(center_x, 2), "cy": round(center_y, 2)})
    outline = path_for_geometry(all_geometry, project)
    output = Path("src/lib/kenya-counties.ts")
    text = "// Generated from geoBoundaries KEN ADM1 simplified GeoJSON (2020); Public Domain.\n"
    text += "export type CountyFeature = { id: string; name: string; d: string; cx: number; cy: number };\n"
    text += "export const KENYA_COUNTIES: CountyFeature[] = " + json.dumps(rows, ensure_ascii=False, separators=(",", ":")) + ";\n"
    text += "export const KENYA_COUNTY_OUTLINE = " + json.dumps(outline, separators=(",", ":")) + ";\n"
    nairobi_x, nairobi_y = project(*counties["Nairobi"].centroid.coords[0])
    if not counties["Nairobi"].covers(counties["Nairobi"].centroid):
        nairobi_x, nairobi_y = project(*counties["Nairobi"].representative_point().coords[0])
    text += f"export const NAIROBI_HUB = {{ x: {nairobi_x:.2f}, y: {nairobi_y:.2f} }};\n"
    output.write_text(text, encoding="utf-8")
    size = output.stat().st_size
    if size > 100_000:
        raise SystemExit(f"Generated module too large: {size} bytes")
    print(f"Validated {len(rows)} county names; generated {output} ({size} bytes)")


if __name__ == "__main__":
    main()

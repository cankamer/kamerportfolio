"""Realistic hanging pieces for the site, rendered as cut-outs (transparent PNG) in Cycles.

  strands  - bead strings for the fringe between sections (wood, glazed ceramic, glass, brass on cotton thread)
  ornament - one per section in its accent colour: bead stack, glass drop, brass bell, yarn tassel
  tag      - a kraft paper hang tag with a brass eyelet for the contact links (text is HTML on top)

Every image's top edge is the hanging point (centred), so the site can swing it from there.
Real sizes in metres; px_per_m sets how big they come out.

Run: blender -b -P tools/blender/hangings.py
Out: public/media/hang/*.png (then node tools/blender/hang-webp.mjs)
"""
import bpy, bmesh, math, os, random
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'public', 'media', 'hang')
os.makedirs(OUT, exist_ok=True)
random.seed(11)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# section accents from content.js, in page order
SECTIONS = [('about', '#848B74'), ('software', '#3f6680'), ('haneko', '#652fe7'), ('guitar', '#a3402a'),
            ('rov', '#2e7a7a'), ('games', '#9b4a6e'), ('design', '#9a7420'), ('maker', '#b0562b')]
KINDS = ['beads', 'drop', 'bell', 'tassel']
PALETTE = ['#848B74', '#b8643c', '#b8925a', '#3a3631', '#a7ad97', '#d9a77f', '#6b7048', '#e8dcc8']

def lin(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c) + (1.0,)

# ───────────── materials ─────────────
def mat(name, color, rough=0.5, metal=0.0, **extra):
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    vals = {'Base Color': lin(color), 'Roughness': rough, 'Metallic': metal}
    vals.update({k.replace('_', ' '): v for k, v in extra.items()})
    for k, v in vals.items():
        if k in b.inputs:
            b.inputs[k].default_value = v
    return m, b

def bump(m, b, scale, strength, detail=6.0, stretch=None):
    nt = m.node_tree
    tc = nt.nodes.new('ShaderNodeTexCoord')
    nz = nt.nodes.new('ShaderNodeTexNoise')
    nz.inputs['Scale'].default_value = scale
    nz.inputs['Detail'].default_value = detail
    src = tc.outputs['Object']
    if stretch:
        mp = nt.nodes.new('ShaderNodeMapping')
        mp.inputs['Scale'].default_value = stretch
        nt.links.new(src, mp.inputs['Vector'])
        src = mp.outputs[0]
    nt.links.new(src, nz.inputs['Vector'])
    bp = nt.nodes.new('ShaderNodeBump')
    bp.inputs['Strength'].default_value = strength
    nt.links.new(nz.outputs['Fac'], bp.inputs['Height'])
    nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return nz

def wood(color):
    m, b = mat(f'wood{color}', color, 0.55)
    nt = m.node_tree
    nz = bump(m, b, 900, 0.25, 4, (1, 1, 14))
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    c = lin(color)
    ramp.color_ramp.elements[0].color = tuple(x * 0.72 for x in c[:3]) + (1,)
    ramp.color_ramp.elements[1].color = c
    nt.links.new(nz.outputs['Fac'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    return m

def ceramic(color):
    # matte, hand-glazed look rather than a polished one
    m, _ = mat(f'ceramic{color}', color, 0.5, 0.0, Coat_Weight=0.12, Coat_Roughness=0.35, Specular_IOR_Level=0.35)
    return m

def glass(color):
    # tinted glass gets dark fast through two surfaces: mix the tint well towards clear
    c = [int(color.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)]
    light = '#%02x%02x%02x' % tuple(round(v + (255 - v) * 0.62) for v in c)
    m, _ = mat(f'glass{color}', light, 0.16, 0.0, Transmission_Weight=1.0, IOR=1.45, Specular_IOR_Level=0.4)   # lightly frosted
    return m

BRASS = mat('brass', '#a88552', 0.52, 0.9)[0]   # aged, brushed brass
COTTON, cb = mat('cotton', '#4a4038', 0.9, 0.0, Sheen_Weight=0.4)

def bead_material(color):
    r = random.random()
    if color in ('#b8925a',) or r < 0.12:
        return BRASS
    if r < 0.42:
        return wood(color)
    if r < 0.82:
        return ceramic(color)
    return glass(color)

# ───────────── geometry ─────────────
COLL = {}
def coll(name):
    c = bpy.data.collections.new(name)
    scene.collection.children.link(c)
    COLL[name] = c
    return c

def obj(name, bm, m, c, smooth=True, sub=0):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(m)
    if smooth:
        for p in me.polygons:
            p.use_smooth = True
    o = bpy.data.objects.new(name, me)
    c.objects.link(o)
    if sub:
        md = o.modifiers.new('s', 'SUBSURF'); md.levels = md.render_levels = sub
    return o

def sphere(c, m, r, z, x=0.0, flat=1.0):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=18, radius=r)
    # threading hole look: flatten a little top and bottom
    for v in bm.verts:
        v.co.z *= flat
    o = obj('bead', bm, m, c)
    o.location = (x, 0, z)
    return o

def tube(c, m, r, h, z, x=0.0):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=28, radius1=r, radius2=r, depth=h)
    o = obj('tube', bm, m, c)
    md = o.modifiers.new('b', 'BEVEL'); md.width = r * 0.35; md.segments = 3
    o.location = (x, 0, z)
    return o

def lathe(c, m, profile, name, segs=48):
    """profile: (r, z) points from top to bottom, revolved around Z."""
    bm = bmesh.new()
    rings = []
    for i in range(segs):
        a = 2 * math.pi * i / segs
        rings.append([bm.verts.new((r * math.cos(a), r * math.sin(a), z)) for r, z in profile])
    for i in range(segs):
        r0, r1 = rings[i], rings[(i + 1) % segs]
        for j in range(len(profile) - 1):
            bm.faces.new((r0[j], r1[j], r1[j + 1], r0[j + 1]))
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-7)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return obj(name, bm, m, c)

def thread(c, top, bottom, r=0.00035, m=None, wiggle=0.0):
    cu = bpy.data.curves.new('thread', 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth, cu.bevel_resolution = r, 3
    sp = cu.splines.new('BEZIER')
    pts = [top, ((top[0] + bottom[0]) / 2 + wiggle, 0, (top[2] + bottom[2]) / 2), bottom]
    sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    cu.materials.append(m or COTTON)
    o = bpy.data.objects.new('thread', cu)
    c.objects.link(o)
    return o

# ───────────── items ─────────────
ITEMS = []   # (collection, file name, px per metre)

def strand(i):
    c = coll(f'strand{i}')
    length = random.uniform(0.04, 0.11)
    z = -0.004
    while True:
        kind = random.random()
        color = random.choice(PALETTE)
        if kind < 0.55:
            r = random.uniform(0.0028, 0.0045)
            sphere(c, bead_material(color), r, z - r, flat=random.choice([1.0, 0.8, 0.65]))
            z -= 2 * r * 0.92
        elif kind < 0.8:
            r = random.uniform(0.0014, 0.0019)
            for _ in range(random.randint(2, 4)):   # little seed beads
                sphere(c, ceramic(random.choice(PALETTE)), r, z - r, flat=0.8)
                z -= 2 * r * 0.85
        else:
            r, h = random.uniform(0.0018, 0.0024), random.uniform(0.006, 0.01)
            tube(c, bead_material(color), r, h, z - h / 2)
            z -= h
        z -= random.uniform(0.0002, 0.0012)
        if -z > length:
            break
    # the last bead is the weight at the end: a bigger one
    r = random.uniform(0.0045, 0.006)
    sphere(c, bead_material(random.choice(PALETTE)), r, z - r)
    thread(c, (0, 0, 0), (0, 0, z - r * 1.6))
    ITEMS.append((c, f'strand-{i}', 3200))

def ornament(idx, section, color):
    kind = KINDS[idx % len(KINDS)]
    c = coll(f'orn-{section}')
    top = -0.012          # a bit of cord at the top of the image
    if kind == 'beads':
        z = top
        tube(c, BRASS, 0.0028, 0.004, z - 0.002); z -= 0.0045
        for r, m in ((0.0075, ceramic(color)), (0.0032, BRASS), (0.011, wood(color)), (0.0035, BRASS),
                     (0.0085, ceramic('#e8dcc8')), (0.004, ceramic('#3a3631'))):
            sphere(c, m, r, z - r, flat=0.9)
            z -= 2 * r * 0.9 + 0.0004
        thread(c, (0, 0, 0), (0, 0, z))
    elif kind == 'drop':
        L, R = 0.05, 0.019
        prof = []
        for k in range(41):
            a = math.pi * k / 40
            prof.append((max(1e-5, R * math.sin(a) * math.sin(a / 2) ** 1.2), top - 0.006 - L * (1 - math.cos(a)) / 2))
        lathe(c, glass(color), prof, 'drop', 64)
        tube(c, BRASS, 0.0034, 0.007, top - 0.003)
        sphere(c, BRASS, 0.0022, top + 0.001)
        thread(c, (0, 0, 0), (0, 0, top))
    elif kind == 'bell':
        prof = [(0.0001, top - 0.004), (0.004, top - 0.005), (0.0075, top - 0.011), (0.0085, top - 0.022), (0.011, top - 0.031),
                (0.0155, top - 0.038), (0.0165, top - 0.0405), (0.0155, top - 0.041), (0.0102, top - 0.034), (0.0078, top - 0.024),
                (0.0066, top - 0.012), (0.0034, top - 0.0065), (0.0001, top - 0.006)]
        lathe(c, BRASS, prof, 'bell', 72)
        sphere(c, BRASS, 0.0024, top - 0.002)
        thread(c, (0, 0, -0.03 + top), (0, 0, top - 0.043), r=0.0003)
        sphere(c, ceramic(color), 0.0042, top - 0.047)        # clapper bead in the section colour
        sphere(c, ceramic(color), 0.0055, top + 0.004, flat=0.9)
        thread(c, (0, 0, 0), (0, 0, top))
    elif kind == 'tassel':
        yarn, yb = mat(f'yarn{color}', color, 0.85, 0.0, Sheen_Weight=0.8, Sheen_Roughness=0.4)
        bump(yarn, yb, 4000, 0.3, 3, (1, 1, 0.2))
        sphere(c, yarn, 0.0072, top - 0.007, flat=1.05)           # wrapped knot
        band = tube(c, BRASS, 0.0062, 0.0035, top - 0.0165)
        for k in range(150):
            a = random.uniform(0, 2 * math.pi)
            rr = 0.0055 * math.sqrt(random.random())
            x0, y0 = rr * math.cos(a), rr * math.sin(a)
            ln = random.uniform(0.046, 0.054)
            spread = 1.0 + random.uniform(0.2, 0.7)
            cu = bpy.data.curves.new('yarn', 'CURVE')
            cu.dimensions = '3D'
            cu.bevel_depth, cu.bevel_resolution = 0.00042, 1
            sp = cu.splines.new('BEZIER')
            pts = [(x0, y0, top - 0.016), (x0 * spread + random.uniform(-4e-4, 4e-4), y0 * spread, top - 0.016 - ln * 0.5),
                   (x0 * spread * 1.15 + random.uniform(-8e-4, 8e-4), y0 * spread * 1.15, top - 0.016 - ln)]
            sp.bezier_points.add(2)
            for bp, p in zip(sp.bezier_points, pts):
                bp.co = p
                bp.handle_left_type = bp.handle_right_type = 'AUTO'
            cu.materials.append(yarn)
            c.objects.link(bpy.data.objects.new('yarn', cu))
        thread(c, (0, 0, 0), (0, 0, top))
    ITEMS.append((c, f'orn-{section}', 3600))

def tag():
    c = coll('tag')
    W, H, T = 0.048, 0.03, 0.0004
    # arch-topped tag outline
    pts = []
    for k in range(25):
        a = math.pi * k / 24
        pts.append((W / 2 * math.cos(a), -0.012 + 0.0 - (W / 2) * 0.42 * (1 - math.sin(a)) + 0.0))
    pts = [(x, -0.004 - (W / 2) * 0.42 * (1 - math.sin(math.pi * k / 24))) for k, (x, _) in enumerate(pts)]
    outline = pts + [(-W / 2, -0.004 - H), (W / 2, -0.004 - H)]
    bm = bmesh.new()
    front = [bm.verts.new((x, -T / 2, z)) for x, z in outline]
    back = [bm.verts.new((x, T / 2, z)) for x, z in outline]
    bm.faces.new(front)
    bm.faces.new(list(reversed(back)))
    n = len(outline)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((front[i], front[j], back[j], back[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    kraft, kb = mat('kraft', '#c29a6b', 0.85, 0.0)
    nt = kraft.node_tree
    fib = bump(kraft, kb, 1800, 0.35, 8)
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = lin('#a9824f')
    ramp.color_ramp.elements[1].color = lin('#d0ab7d')
    nt.links.new(fib.outputs['Fac'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], kb.inputs['Base Color'])
    o = obj('tag', bm, kraft, c, smooth=False)
    # brass eyelet and the twine loop up to the hanging point
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=False, segments=40, radius=0.0028)
    eye = obj('eyelet', bm, BRASS, c)
    eye.rotation_euler = (math.pi / 2, 0, 0)
    eye.location = (0, -T, -0.0085)
    md = eye.modifiers.new('sk', 'SKIN') if False else None
    ring_cu = bpy.data.curves.new('ring', 'CURVE')
    ring_cu.dimensions = '3D'
    ring_cu.bevel_depth, ring_cu.bevel_resolution = 0.0009, 4
    sp = ring_cu.splines.new('POLY')
    sp.points.add(47)
    for k, p in enumerate(sp.points):
        a = 2 * math.pi * k / 47
        p.co = (0.0028 * math.cos(a), -T, -0.0085 + 0.0028 * math.sin(a), 1)
    sp.use_cyclic_u = True
    ring_cu.materials.append(BRASS)
    c.objects.link(bpy.data.objects.new('ring', ring_cu))
    bpy.data.objects.remove(eye, do_unlink=True)
    twine, tb = mat('twine', '#8a6f4e', 0.9, 0.0, Sheen_Weight=0.5)
    thread(c, (0, -T, 0), (-0.0012, -T * 2, -0.0085), r=0.0005, m=twine, wiggle=-0.001)
    thread(c, (0, -T, 0), (0.0012, -T * 2, -0.0085), r=0.0005, m=twine, wiggle=0.001)
    ITEMS.append((c, 'tag', 4400))

for i in range(10):
    strand(i)
for i, (sec, color) in enumerate(SECTIONS):
    ornament(i, sec, color)
tag()

# ───────────── light, camera, render ─────────────
w = bpy.data.worlds.new('w'); scene.world = w
try:
    w.use_nodes = True
except Exception:
    pass
bg = next(n for n in w.node_tree.nodes if n.type == 'BACKGROUND')
bg.inputs['Color'].default_value = lin('#e9e4d8')
bg.inputs['Strength'].default_value = 0.45

def area(name, loc, energy, size, color='#ffffff'):
    ld = bpy.data.lights.new(name, 'AREA'); ld.energy = energy; ld.size = size; ld.color = lin(color)[:3]
    o = bpy.data.objects.new(name, ld); scene.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = (Vector((0, 0, -0.04)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    return o

area('key', (-0.25, -0.35, 0.25), 18, 0.9, '#fff4e6')    # big, soft sources: no hard glints
area('fill', (0.35, -0.3, -0.05), 6, 1.0, '#eef2ff')
area('rim', (0.05, 0.3, 0.2), 6, 0.8)

cd = bpy.data.cameras.new('cam'); cd.type = 'ORTHO'
cam = bpy.data.objects.new('cam', cd); scene.collection.objects.link(cam)
cam.rotation_euler = (math.pi / 2, 0, 0)
scene.camera = cam

scene.render.engine = 'CYCLES'
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'OPTIX'
    prefs.refresh_devices()
    for dv in prefs.devices:
        dv.use = dv.type == 'OPTIX'
    scene.cycles.device = 'GPU'
except Exception as e:
    print('gpu', e)
scene.cycles.samples = 128
scene.cycles.use_denoising = True
scene.render.film_transparent = True
scene.cycles.film_transparent_glass = True
scene.cycles.film_transparent_roughness = 0.25
scene.view_settings.view_transform = 'Standard'   # keep the palette's colours as they are
scene.view_settings.exposure = -1.25
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'

dg = bpy.context.evaluated_depsgraph_get()
for c, name, ppm in ITEMS:
    for other in COLL.values():
        other.hide_render = other is not c
    bpy.context.view_layer.update()
    xs, zs = [], []
    for o in c.objects:
        ev = o.evaluated_get(dg)
        me = ev.to_mesh()
        for v in me.vertices:
            p = o.matrix_world @ v.co
            xs.append(p.x); zs.append(p.z)
        ev.to_mesh_clear()
    pad = 0.0012
    half = max(abs(min(xs)), abs(max(xs))) + pad     # centred on the hanging point
    wdt, top, bottom = 2 * half, 0.0, min(zs) - pad
    hgt = top - bottom
    scene.render.resolution_x = max(8, round(wdt * ppm))
    scene.render.resolution_y = max(8, round(hgt * ppm))
    cd.ortho_scale = max(wdt, hgt)
    cam.location = (0, -1, (top + bottom) / 2)
    scene.render.filepath = os.path.join(OUT, f'{name}.png')
    bpy.ops.render.render(write_still=True)
    print('rendered', name, scene.render.resolution_x, scene.render.resolution_y)

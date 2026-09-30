export type Category = 'XR & Interaction' | 'Computational Tools' | 'Fabrication & Materials' | 'Architecture & Facades' | 'Generative Studies'
export type Media = { id: string; alt: string; caption: string; credit: string; fit?: 'contain' }
export type Section = { title: string; text: string }
export type Project = {
  slug: string; title: string; subtitle: string; category: Category; year: string;
  context: string; location: string; role: string; summary: string; premise: string;
  tags: string[]; featured?: boolean; cover: Media; gallery: Media[];
  sections: Section[]; credits: string[]; links?: { label: string; url: string }[];
}

const archive = 'Chia-Hsuan Chao / project portfolio'
const eth = 'Project documentation / ETH MAS DFAB'
const pkd = 'Project documentation / PKD Engineering Consultants'
const photo = (id: string, alt: string, caption: string, credit = archive, fit?: 'contain'): Media => ({ id, alt, caption, credit, fit })

export const PROFILE = {
  name: 'JosHsuan', fullName: 'Chia-Hsuan Chao',
  email: 'chiahsuanchao@icloud.com', github: 'https://github.com/JosHsuan',
  statement: 'Computational design, XR & digital fabrication.',
}

export const categories: Category[] = ['XR & Interaction', 'Computational Tools', 'Fabrication & Materials', 'Architecture & Facades', 'Generative Studies']

export const projects: Project[] = [
  {
    slug: 'echoxr', title: 'EchoXR', subtitle: 'Hearing a space, together.', category: 'XR & Interaction', year: '2024–25', featured: true,
    context: 'Gramazio Kohler Research / ETH Zürich', location: 'Zürich, Switzerland', role: 'XR development, tracking, multiplayer networking & material shaders',
    summary: 'A shared virtual environment for exploring how architectural decisions change the sound of a room.',
    premise: 'Architecture is heard as well as seen. EchoXR brings spatial acoustics into a collaborative VR environment, so participants can explore a design through movement, conversation and sound.',
    tags: ['Unity', 'C#', 'VR', 'Spatial audio', 'OptiTrack'],
    cover: photo('echo-shared', 'Two participants exploring the same room with VR headsets', 'A shared physical space becomes a collaborative virtual design environment.', 'EchoXR / Gramazio Kohler Research'),
    gallery: [photo('echo-room', 'Virtual room with suspended acoustic panels and an in-world control interface', 'Geometry and acoustic elements can be explored inside the room.', 'EchoXR / Gramazio Kohler Research'), photo('echo-gesture', 'Virtual hands manipulating an audio source in the room', 'A gesture brings sound-source interaction into the virtual space.', 'EchoXR / Gramazio Kohler Research'), photo('echo-setup', 'Axonometric diagram of the tracking cameras and participants in the room', 'The physical tracking setup connects participants to the shared environment.', 'EchoXR / Gramazio Kohler Research', 'contain')],
    sections: [
      { title: 'From an image to an experience', text: 'A render can communicate the appearance of a room while leaving its acoustic character abstract. The project combines a virtual architectural model with spatial audio, allowing a group to consider materials, partitions and sound sources from within the design.' },
      { title: 'An interface inside the space', text: 'Hand interaction and in-world controls keep editing close to the objects being discussed. Participants can explore different configurations without stepping out into a separate desktop interface. The archived study includes room layouts, acoustic elements and sound-source controls.' },
      { title: 'My contribution', text: 'As a research assistant, I worked on VR/AR development, body and environment tracking, a networked multiplayer framework, and material rendering using Unity Shader Graph. Acoustic research and the overall platform were collaborative work; these responsibilities describe my contribution within that team.' },
      { title: 'Research outcome', text: 'The project was documented in the 2025 IHIET paper “EchoXR: A Collaborative VR Framework for Spatial Acoustics in Architectural Design.” The research documents the prototype, its interaction model and acoustic workflow, presenting an approach to collaborative acoustic exploration.' },
    ],
    credits: ['Research: Fabio Scotto, Chia-Hsuan Chao, Giacomo Montiani and Achilleas Xydis, Gramazio Kohler Research, ETH Zürich.', 'Paper co-authors: Fabio Scotto, Chia-Hsuan Chao, Giacomo Montiani, Achilleas Xydis, Fabio Gramazio and Matthias Kohler.'],
    links: [{ label: 'ETH project overview', url: 'https://designplusplus.ethz.ch/research/concluded-projects/echo-xr.html' }, { label: 'Read the paper · IHIET 2025', url: 'https://doi.org/10.54941/ahfe1006713' }],
  },
  {
    slug: 'xr-bending-active', title: 'XR-assisted Bending-Active Assembly', subtitle: 'Let the physical model talk back.', category: 'XR & Interaction', year: '2024', featured: true,
    context: 'MAS Architecture & Digital Fabrication / ETH Zürich', location: 'Zürich, Switzerland', role: 'Collaborative thesis · motion capture, adaptive geometry & XR assembly workflow',
    summary: 'Motion capture connects the changing shape of bamboo to adaptive digital models and on-site assembly guidance.',
    premise: 'A bending-active structure changes as it is assembled. This thesis explores how an XR workflow can respond to the material in front of the worker, rather than only displaying a fixed digital model.',
    tags: ['COMPAS XR', 'Motion capture', 'Unity', 'Grasshopper', 'MQTT'],
    cover: photo('xr-structure', 'Bending-active bamboo structure with connected curved modules', 'A modular bamboo demonstrator connects material behavior and adaptive design.', eth),
    gallery: [photo('xr-guidance', 'A phone showing assembly guidance next to the physical bamboo module', 'Mobile XR guidance places assembly information alongside the material.', eth), photo('xr-assembly', 'A participant assembling a bamboo module by hand', 'The assembly workflow is tested through physical construction.', eth)],
    sections: [
      { title: 'Responding to material behavior', text: 'Bamboo rods bend and vary. A predesigned model alone cannot describe every physical change during assembly. The workflow uses optical motion capture to bring the posture of the rods into the digital environment and update the geometry around that information.' },
      { title: 'A physical–digital loop', text: 'Passive markers, OptiTrack cameras, geometry computation and a mobile application form a feedback loop. Site planes, foundation points and branch parameters can be adjusted; the resulting model informs the next assembly step. Tracking and geometry updates remain connected to the same physical reference frame.' },
      { title: 'Guidance at the point of making', text: 'The application brings module selection, rod visualization and assembly instructions to the worker. The bamboo demonstrator tests an adaptive design-to-assembly method through physical construction and real-time geometry updates.' },
    ],
    credits: ['Collaborative thesis with Wataru Nomura.', 'Tutors: Alexandra Moisi and Prof. Daniela Mitterberger.', 'Developed within ETH MAS DFAB and the COMPAS XR research context.'],
  },
  {
    slug: 'woodflow', title: 'Woodflow', subtitle: 'Tools for material-aware design.', category: 'Computational Tools', year: 'Software practice',
    context: 'Strong by Form', location: 'Computational software development', role: 'Geometry tooling & product-model development',
    summary: 'Computational software work connecting geometric reasoning with digital timber product workflows.',
    premise: 'A design tool needs to describe more than a visible shape. Work in the Woodflow ecosystem explores reusable geometric data, product representation and the relationships that make a model useful across a design workflow.',
    tags: ['Python', 'Geometry', 'Product modeling', 'Digital timber'],
    cover: photo('woodflow-workflow', 'Editorial diagram connecting geometry, material and making', 'A high-level view of the practice: geometry, material and making.', 'Original editorial illustration for this portfolio', 'contain'),
    gallery: [],
    sections: [
      { title: 'Making intent explicit', text: 'The software work focuses on geometry foundations and structured product models. Separating data, geometric operations and product relationships makes each layer easier to reason about, extend and review.' },
      { title: 'Industrial context', text: 'Strong by Form combines computational design and digital fabrication in its Woodflow technology. This portfolio entry describes my area of software practice. Company product information is available through the public link below; the illustration is an editorial overview rather than a product or manufacturing specification.' },
    ],
    credits: ['Company context: Strong by Form / Woodflow.', 'Original editorial illustration created for this portfolio. Public company information is available through the official website.'],
    links: [{ label: 'Strong by Form', url: 'https://www.strongbyform.com/' }],
  },
  {
    slug: 'metal-panels', title: 'Bending-Active Metal Panels', subtitle: 'A pattern that carries a shape.', category: 'Fabrication & Materials', year: '2020 · paper 2023', featured: true,
    context: 'Master’s thesis / National Cheng Kung University', location: 'Tainan, Taiwan', role: 'Individual thesis · computational method, material studies & prototypes',
    summary: 'Miura-derived patterns connect a target surface to the deformation of a thin metal panel.',
    premise: 'Form finding starts with material behavior; form conversion starts with a desired shape. This research looks for a connection between the two through a pattern-based representation of a bending-active plate.',
    tags: ['Bending-active', 'Miura patterns', 'Simulation', 'Material testing'],
    cover: photo('metal-prototype', 'Assembled curved metal panels forming a low architectural prototype', 'The assembled prototype tests the relationship between panel pattern and global shape.'),
    gallery: [photo('metal-detail', 'Close-up of perforated metal panels and their connections', 'Local connections and panel deformation produce a continuous surface.'), photo('metal-analysis', 'Colored computational analysis across the target surface', 'A geometric representation connects the proposed surface to panel behavior.', archive, 'contain')],
    sections: [
      { title: 'Between prediction and form finding', text: 'The method uses a Miura origami representation to describe the flow of a bending-active surface. Linear regression is used to approximate the relationship between that representation and the proposed geometry.' },
      { title: 'Testing the representation', text: 'Computational studies and physical material tests develop together. Panel patterns, connections and assembled prototypes make it possible to compare a geometric proposal with the behavior of the metal, and to refine how the surface is represented.' },
      { title: 'From thesis to publication', text: 'The individual thesis was completed at NCKU in 2020 and developed into a co-authored CAADRIA 2023 publication. The work demonstrates a pattern-based research method through computational studies and physical prototypes.' },
    ],
    credits: ['Thesis author: Chia-Hsuan Chao. Supervisor: Prof. Kane Yanagawa.', 'CAADRIA 2023 paper: Chia-Hsuan Chao and Kane Yanagawa, pp. 201–210.'],
    links: [{ label: 'NCKU thesis record', url: 'https://thesis.lib.ncku.edu.tw/thesis/detail/e9eac9c2b822e64726474a184f9e5c1a/' }, { label: 'CAADRIA publication record', url: 'https://researchoutput.ncku.edu.tw/en/persons/kane-yanagawa/' }],
  },
  {
    slug: 'caschlatsch', title: 'Caschlatsch', subtitle: 'From digital modules to a shared landmark.', category: 'Fabrication & Materials', year: '2024', featured: true,
    context: 'ETH MAS DFAB / Gramazio Kohler Research', location: 'Disentis/Mustér, Switzerland', role: 'Team project · computational development & COMPAS XR assembly guidance',
    summary: 'A collaborative timber installation brings parametric design, robotic fabrication and on-site assembly together.',
    premise: 'A timber structure on a historic rocky outcrop becomes a place for hikers to pause. The project connects a digitally developed modular system to fabrication and a collective assembly process.',
    tags: ['Timber', 'COMPAS', 'XR assembly', 'Parametric design'],
    cover: photo('caschlatsch-built', 'Timber tower suspended above a rocky wooded site in Disentis', 'The completed installation sits within the wooded terrain of Disentis/Mustér.', eth),
    gallery: [photo('caschlatsch-model', 'Architectural model of the timber tower and its topographic site', 'Site and modular structure are considered together.', eth, 'contain'), photo('caschlatsch-joint', 'Close-up of timber members meeting inside the installation', 'The digital aggregation becomes a network of physical connections.', eth)],
    sections: [
      { title: 'Organizing complexity', text: 'The portfolio documents voxel-based beam aggregation and modular structural infill. Spatial indexing and controlled beam directions organize the relationship between individual members and the larger assembly.' },
      { title: 'Connecting model and worker', text: 'My documented contribution includes COMPAS XR module selection and assembly guidance. Serialized design information supports a mobile interface for locating and managing modules during assembly, linking the model to work on site.' },
      { title: 'A collective built result', text: 'The installation was developed by the ETH MAS DFAB cohort with Gramazio Kohler Research and partners in Disentis/Mustér. It was unveiled in September 2024. The project combines computational methods with the judgment and coordination of the people making it.' },
    ],
    credits: ['Collective project: ETH MAS DFAB 2023–24 cohort and Gramazio Kohler Research.', 'Tutors: Ananya Kango, Simon Griffioen and Petrus Aejmelaeus-Lindström.', 'Local collaboration: #dfdu AG, Studio UH Architects ETH SIA and Nicolas Fehlmann Ingénieurs Conseils SA. Client: Gemeinde Disentis/Mustér. Full team credits are available on the official project page.'],
    links: [{ label: 'Official project & full credits', url: 'https://www.gramaziokohler.arch.ethz.ch/web/lehre/e/0/0/0/496.html' }, { label: 'Opening · NCCR Digital Fabrication', url: 'https://dfab.ch/news/opening-of-caschlatsch' }],
  },
  {
    slug: 'nanshan-installation', title: 'Nan Shan Entrance Installation', subtitle: 'A continuous form, made from folded parts.', category: 'Architecture & Facades', year: '2021–22', featured: true,
    context: 'PKD Engineering Consultants', location: 'Taichung, Taiwan', role: 'Scheme development, 3D modeling & fabrication drawings',
    summary: 'A faceted entrance installation translates complex geometry into aluminum panels and fabrication information.',
    premise: 'The entrance installation at Taichung Nan Shan no.6 Square is built from folded aluminum panels. The design challenge is to connect the continuity of the overall surface to the individual parts a workshop can fabricate and a team can assemble.',
    tags: ['Panelization', 'Aluminum', 'Rhino', 'Fabrication drawings'],
    cover: photo('installation-built', 'Curved aluminum entrance installation against the blue sky', 'Folded panels and openings articulate the completed entrance.', pkd),
    gallery: [photo('installation-process', 'Four stages developing the installation from a smooth surface to a perforated panel system', 'The scheme develops from a continuous surface into a panel system.', pkd, 'contain'), photo('installation-panels', 'Close-up of triangular folded aluminum panels', 'Panel folds and openings give the surface depth.', pkd), photo('installation-assembly', 'Workers assembling a segment of the aluminum installation in a workshop', 'Fabrication information supports workshop assembly.', pkd)],
    sections: [
      { title: 'Surface to parts', text: 'Geometry development and panelization work together. The overall form is rationalized into folded panels with varying openings, preserving the expression of the surface while making each part describable in fabrication drawings.' },
      { title: 'My contribution', text: 'Within a three-person development team, I worked on scheme development, 3D modeling and fabrication drawings. The key workflow was the bidirectional translation between a 3D model and the 2D information needed by the aluminum fabricator.' },
      { title: 'Assembly and detail', text: 'The portfolio documents a built result assembled from approximately 600 aluminum panels. Details and workshop photographs show how the digital scheme was resolved through human fabrication and assembly. The archive labels design development in 2021 and indexes the work in 2022; the date range preserves that distinction.' },
    ],
    credits: ['PKD Engineering Consultants. Employer: Peter Chen. Commissioned by Fu Tsu Construction.', 'Collaboration: Zhi-Yu Guo (2D drawings) and Monita (structural work).', 'Images: the owner’s project archive / PKD project documentation.'],
  },
  {
    slug: 'heat-rotate-cutting', title: 'Heat Rotate Cutting', subtitle: 'Designing the tool, designing the material.', category: 'Fabrication & Materials', year: '2018–20', featured: true,
    context: 'Mode/s of Making / National Cheng Kung University', location: 'Tainan, Taiwan', role: 'Studio project · machine development, toolpaths & material experiments',
    summary: 'A custom heated-cutting apparatus explores the relationship between machine movement and material form.',
    premise: 'A fabrication mechanism can be a starting point for design. This project builds a digitally controlled cutting apparatus and investigates the forms its motion can produce.',
    tags: ['Arduino', 'Marlin', 'Machine making', 'Toolpaths'],
    cover: photo('heat-machine', 'Custom cutting machine next to a fabricated cellular foam prototype', 'A custom apparatus and its material experiments.', 'Project archive / photography includes Jan Kyselý'),
    gallery: [photo('heat-material', 'Close-up of a carved foam surface with flowing ridges', 'Cutting motion leaves a material texture.', 'Jan Kyselý / project archive'), photo('heat-detail', 'Blue mechanical component mounted on the machine frame', 'Custom parts connect motion control to the cutting mechanism.', 'Jan Kyselý / project archive')],
    sections: [
      { title: 'A machine as a design instrument', text: 'Arduino and Marlin connect digital instructions to the mechanism. Cutting paths, speed and other variables become design parameters, allowing the fabrication process to inform the geometry rather than simply receive it.' },
      { title: 'From mechanism to family of forms', text: 'Prototypes explore how the movement of the heated cutter changes surface and volume. The work joins machine making, computational design and material observation. The project pages date the study to 2018; the later portfolio index places it in 2020, so this entry uses the archive’s development range.' },
    ],
    credits: ['National Cheng Kung University. Tutor: Prof. Kane Yanagawa.', 'Photography: Jan Kyselý where credited in the source portfolio. Additional images from the project archive.'],
  },
  {
    slug: 'v-shape-aggregation', title: 'V-Shape Modular Aggregation', subtitle: 'A rule for assembly, a path for the robot.', category: 'Fabrication & Materials', year: '2023',
    context: 'ETH MAS DFAB / Special Assemblies', location: 'Zürich, Switzerland', role: 'Collaborative project · aggregation logic & robotic assembly studies',
    summary: 'Reciprocal stick modules connect a bottom-up geometry rule to robotically assembled spatial structures.',
    premise: 'A small V-shaped module becomes the basis for a larger reciprocal structure. Geometry generation and robotic sequence planning are developed as parts of the same assembly problem.',
    tags: ['Robotics', 'COMPAS', 'Python', 'Assembly planning'],
    cover: photo('robotic-assembly', 'Robot arm placing a timber stick into a small spatial structure', 'The assembly rule is tested at the robotic workcell.', eth),
    gallery: [photo('robotic-sequence', 'Diagram of a robot arm positioning a stick beside an aggregated structure', 'A planned placement connects geometric rules to robot movement.', eth, 'contain'), photo('robotic-prototype', 'Completed stick aggregation beside a robotic arm', 'The physical prototype makes the assembly sequence visible.', eth)],
    sections: [{ title: 'From behavior to a rule', text: 'Observed aggregation behaviors were organized into four categories and translated into an object-oriented generation method. The study then examines collision-aware trajectories and the order in which sticks can be placed.' }, { title: 'A collaborative experiment', text: 'The resulting prototype demonstrates a design-to-assembly workflow at a small scale. It brings reciprocal geometry, robotic control and physical testing together, while keeping the relationship between individual placement and the overall structure legible.' }],
    credits: ['Collaboration: Kevin Seav and Megi Sinani.', 'Tutors: Ananya Kango, Simon Griffioen and Petrus Aejmelaeus-Lindström. ETH MAS DFAB.'],
  },
  {
    slug: 'non-planar-printing', title: 'Dot-Based Non-Planar Printing', subtitle: 'A surface written by a toolpath.', category: 'Fabrication & Materials', year: '2023',
    context: 'ETH MAS DFAB / Printing Architecture', location: 'Zürich, Switzerland', role: 'Collaborative project · print parameters, toolpath studies & physical samples',
    summary: 'Dot-based deposition and non-planar paths generate open, textile-like printed surfaces.',
    premise: 'Instead of treating printing as the reproduction of a solid model, this study uses the deposition path itself to create texture, openness and a family of material effects.',
    tags: ['3D printing', 'G-code', 'Non-planar paths', 'Material studies'],
    cover: photo('printing-object', 'White twisting non-planar printed object photographed outdoors in snow', 'A continuous printed object emerges from the deposition strategy.', 'Chia-Hsuan Chao / ETH MAS DFAB'),
    gallery: [photo('printing-samples', 'A collection of blue and white printed material samples', 'Parameter variations are compared through a family of physical samples.', 'Chia-Hsuan Chao / ETH MAS DFAB', 'contain')],
    sections: [{ title: 'Parameters become texture', text: 'Layer height, density and velocity affect local deposition. Small samples establish a printing rule before it is applied to more complex forms. The resulting surfaces record the relationship between geometry and how material is laid down.' }, { title: 'From samples to objects', text: 'The work extends those local observations to non-planar geometry, producing detailed objects with varied texture. It is a fabrication study developed with Namdev Talluru within the ETH MAS DFAB program.' }],
    credits: ['Collaboration: Namdev Talluru.', 'Tutors: Ananya Kango, Simon Griffioen and Petrus Aejmelaeus-Lindström. Photography: Chia-Hsuan Chao where credited in the portfolio.'],
  },
  {
    slug: 'inside-out', title: 'Inside Out', subtitle: 'Unfolding a complex surface.', category: 'Fabrication & Materials', year: '2019',
    context: 'IDF 2019 / National Yunlin University of Science and Technology', location: 'Yunlin, Taiwan', role: 'Workshop study · mesh design & collaborative prototype assembly',
    summary: 'Form finding and differential tiling translate a complex surface into a physical prototype.',
    premise: 'The workshop moves between mesh analysis, tiling and assembly. A surface is studied through both its digital behavior and the practical steps needed to make it.',
    tags: ['Grasshopper', 'Kangaroo', 'Ivy', 'Mesh analysis'],
    cover: photo('inside-out', 'Perforated white assembled shell displayed inside a workshop', 'A tiled prototype translates the surface into discrete parts.', 'Chia-Hsuan Chao'),
    gallery: [photo('inside-out-workshop', 'Workshop exhibition with a large assembled arch and small study prototypes', 'The study sits within the wider collaborative IDF workshop.', 'Chia-Hsuan Chao')],
    sections: [{ title: 'From mesh to assembly', text: 'Grasshopper, Kangaroo and Ivy support form finding and differential tiling. This entry focuses on the small-team prototype documented in the portfolio; the wider workshop also included a collective assembly phase.' }],
    credits: ['Prototype assembly collaboration: Kenta Saito. Wider group work: IDF 2019 participants.', 'Tutor: Prof. Chung-Han Lee. Photography: Chia-Hsuan Chao.'],
  },
  {
    slug: 'kaohsiung-terminal', title: 'Kaohsiung Port Terminal · Lobe-D', subtitle: 'Resolving the interface of a complex facade.', category: 'Architecture & Facades', year: 'Professional practice',
    context: 'PKD Engineering Consultants', location: 'Kaohsiung, Taiwan', role: 'Lobe-D interface coordination, facade system setup & fabrication-drawing conversion',
    summary: 'Defined facade scopes are coordinated through geometry models and semi-automated drawing workflows.',
    premise: 'Complex architecture becomes buildable through many bounded contributions. This case focuses on facade coordination and the translation of selected systems into fabrication information.',
    tags: ['Rhino', 'Grasshopper', 'AutoCAD', 'Facade coordination'],
    cover: photo('terminal-model', 'Axonometric model of Lobe-D facade layers and selected interface scope', 'The selected facade scope is shown within its structural context.', pkd, 'contain'),
    gallery: [photo('terminal-detail', 'Detailed facade interface model around a structural connection', 'Interface modeling supports coordination between systems.', pkd, 'contain'), photo('terminal-frame', 'Structural frame model for the Lobe-D section', 'Layered models make the relationships between systems explicit.', pkd, 'contain')],
    sections: [{ title: 'My scope within the project', text: 'My documented responsibilities covered interface coordination and 3D-to-fabrication drawing conversion at the tail of Lobe-D, plus system setup and drawing conversion for the west and south facades from floors 3 to 8.' }, { title: 'A model-to-drawing workflow', text: 'Rhino and Grasshopper organize the geometry and its exceptions. Semi-automated AutoCAD Smart-Blocks help transfer that information to the construction drawing team. This is a facade engineering contribution within the larger building project.' }],
    credits: ['Architecture: Reiser + Umemoto and Fei & Cheng Associates. Facade and structural consultancy: PKD Engineering Consultants.', 'Collaboration: Wen-Ting You (2D drawings). Employer: Peter Chen.'],
  },
  {
    slug: 'dome-tessellation', title: 'ChinPaoSan Dome Tessellation', subtitle: 'Finding repetition inside curvature.', category: 'Architecture & Facades', year: 'Design development',
    context: 'PKD Engineering Consultants', location: 'Jinshan, Taiwan', role: 'Early geometry analysis, tessellation & cost-related design studies',
    summary: 'Panel categorization studies balance curved architectural geometry with fabrication considerations.',
    premise: 'A dome can contain many apparently different panels. Geometric analysis and categorization explore where repetition is possible while preserving the intended form.',
    tags: ['Tessellation', 'Panel categorization', 'Geometry analysis'],
    cover: photo('dome-tessellation', 'Colored tessellated sphere showing families of panels', 'Panel families reveal repetition within a curved surface.', pkd, 'contain'),
    gallery: [photo('dome-panels', 'Study of tessellated panels around a curved surface boundary', 'Boundary conditions and local geometry inform the panel study.', pkd, 'contain')],
    sections: [{ title: 'A bounded design-development study', text: 'At PKD, I contributed early-stage geometry analyses, design guidance and cost assessments for the curtain-wall consultancy. The work investigates how tessellation and categorization can support the architectural intent; it does not imply delivery of the entire building.' }],
    credits: ['Architecture: Steven Holl Architects with Chou Chienping Architects. Consultancy: PKD Engineering Consultants.', 'Collaboration: Li-Ting Lin (BIM manager). Employer: Peter Chen.'],
  },
  {
    slug: 'jinshan-church', title: 'Hyatt Jinshan Church', subtitle: 'Flat panels on a curved envelope.', category: 'Architecture & Facades', year: '2021 · design study',
    context: 'PKD Engineering Consultants', location: 'Jinshan, Taiwan', role: 'Geometry optimization & marble facade-system development',
    summary: 'A double-curved envelope is rationalized into a marble panel system under fixed project interfaces.',
    premise: 'The architectural geometry, fire-safety requirements and HVAC interfaces were already established. The facade study works within those constraints to develop a system for flat marble panels.',
    tags: ['Double curvature', 'Marble', 'Panel systems', 'Rationalization'],
    cover: photo('church-model', 'Axonometric model of a curved church envelope and its supporting structure', 'Envelope geometry is coordinated with the supporting structure.', pkd, 'contain'),
    gallery: [photo('church-detail', 'Rear view of the facade model showing curved geometry and structural interfaces', 'The facade is studied within fixed project interfaces.', pkd, 'contain'), photo('church-construction', 'Construction photograph of a curved steel church structure', 'The structural context of the facade study.', 'Li Wei Mechanical Engineering Co., Ltd.')],
    sections: [{ title: 'Working within interfaces', text: 'My responsibilities included geometry optimization, cost-reduction studies and development of the marble facade system. Double-curved surfaces had to remain compatible with already finalized building systems.' }, { title: 'Rationalizing the cladding', text: 'The use of flat marble panels required studies of panel geometry and the support system. The portfolio documents models, sections and construction context. The contribution is facade consultancy within the wider resort project.' }],
    credits: ['PKD Engineering Consultants. Client: Chyi-Yuh Construction. Employer: Peter Chen.', 'Collaboration: Li-Ting Lin (BIM manager). Construction photography: Li Wei Mechanical Engineering Co., Ltd.'],
  },
  {
    slug: 'stare-at-the-silence', title: 'Stare at the Silence', subtitle: 'A mesh, subdivided into detail.', category: 'Generative Studies', year: '2023',
    context: 'ETH MAS DFAB / Mesh Subdivision', location: 'Zürich, Switzerland', role: 'Algorithmic geometry study & visualization',
    summary: 'Iterative subdivision develops a detailed geometric surface from a simple underlying mesh.',
    premise: 'Subdivision is used as a design operation: a broad form becomes an increasingly detailed system of openings, radii and local relationships.',
    tags: ['Mola', 'Mesh subdivision', 'Algorithmic geometry'],
    cover: photo('mesh-sphere', 'Suspended spherical mesh with intricate subdivided openings', 'Global form and local subdivision develop together.', archive),
    gallery: [photo('mesh-detail', 'Close view of patterned mesh cells and their fine geometric details', 'The subdivision rule becomes visible at a smaller scale.')],
    sections: [{ title: 'Detail from a rule', text: 'The study uses the Mola library and iterative mesh operations to explore geometric complexity. It builds on the mesh-subdivision teaching context associated with Prof. Benjamin Dillenburger and is presented as a digital geometry exploration.' }],
    credits: ['ETH MAS DFAB. Tutors: Ananya Kango, Simon Griffioen and Petrus Aejmelaeus-Lindström.', 'Geometry context: Mola library and mesh-subdivision work by Prof. Benjamin Dillenburger.'],
  },
  {
    slug: 'planet-garden', title: 'Planet of Colorful Garden', subtitle: 'A small world grown from rules.', category: 'Generative Studies', year: '2023',
    context: 'ETH MAS DFAB / Generative Art', location: 'Zürich, Switzerland', role: 'Generative geometry, procedural elements & visual composition',
    summary: 'Branching, surface sampling and random transformations generate a family of colorful garden-like worlds.',
    premise: 'Inspired by Harold Cohen’s work, the study combines a collection of procedural elements with a three-dimensional surface and controlled variation.',
    tags: ['GHPython', 'Rhino.Geometry', 'Randomness', 'Generative art'],
    cover: photo('planet-garden', 'Colorful garden-like spherical composition with branches and foliage', 'Procedural elements populate a three-dimensional garden.'),
    gallery: [photo('planet-variations', 'A grid of garden worlds in different colors and configurations', 'The same set of rules produces a family of variations.', archive, 'contain')],
    sections: [{ title: 'A vocabulary for growth', text: 'Trees, branches, leaves and other elements are placed on sampled surface points. Random transformations and color variation alter the composition while the underlying rules maintain a relationship between the elements and the host geometry.' }],
    credits: ['ETH MAS DFAB. Tutors: Ananya Kango, Simon Griffioen and Petrus Aejmelaeus-Lindström.', 'Artistic reference: Harold Cohen.'],
  },
]

export const lab: Project[] = [
  {
    slug: 'enter-the-void', title: 'Enter the Void', subtitle: 'A gyroid becomes a lamp.', category: 'Generative Studies', year: '2018', context: 'NCKU × CHIMEI / MODEX', location: 'Taiwan', role: 'Design-to-fabrication study within an industry collaboration',
    summary: 'A printed lamp studies gyroid geometry, light and the practical requirements of disassembly.', premise: 'A gyroid-derived geometry is morphed onto a hyperbolic paraboloid. The design considers how a complex surface can be printed, assembled and taken apart.', tags: ['Gyroid', '3D printing', 'Lighting'],
    cover: photo('void-lamp', 'Reflective gyroid-inspired printed lamp with curved openings', 'The lamp makes the geometry visible through openings and reflected light.'), gallery: [photo('void-detail', 'Close-up of the curved openings in the printed lamp', 'Local curvature changes the way light passes through the object.')],
    sections: [{ title: 'Geometry meets a product brief', text: 'Developed in the NCKU and CHIMEI / MODEX collaboration, the study demonstrates geometric possibilities of 3D printing while accounting for fabrication and disassembly.' }], credits: ['NCKU × CHIMEI / MODEX industry collaboration. Design work: Chia-Hsuan Chao.'],
  },
  {
    slug: 'puff-waffle', title: 'Puff Waffle', subtitle: 'A surface under pressure.', category: 'Generative Studies', year: '2021', context: 'Independent study', location: 'Taiwan', role: 'Individual geometry & simulation study', summary: 'Differential growth and inflation give a spherical tiling a soft, compressed appearance.', premise: 'Hexagonal panels tile a sphere. Differential-growth curves act as constraints within each panel, and inflation produces the final geometry.', tags: ['Differential growth', 'Inflation', 'Geometry'], cover: photo('puff-waffle', 'Inflated spherical geometry with soft folded hexagonal panels', 'Growth constraints and inflation shape the surface.'), gallery: [], sections: [{ title: 'A rule for softness', text: 'The study is inspired by Andrew Kudless’s P_Wall. It translates an impression of compressed liquid into a procedural relationship between tiling, growth and inflation.' }], credits: ['Individual study: Chia-Hsuan Chao. Reference: Andrew Kudless, P_Wall.'],
  },
  {
    slug: 'eggshell', title: 'EggShell', subtitle: 'One continuous path, a thin shell.', category: 'Fabrication & Materials', year: '2020', context: 'Independent fabrication study', location: 'Taiwan', role: 'Individual geometry, G-code generation & printing', summary: 'Agent-generated patterns become continuous printing paths for very thin objects.', premise: 'Agents move within a constrained surface and leave recorded paths. Those paths become the basis for a continuous print with controlled speed and extrusion.', tags: ['G-code', 'Continuous paths', '3D printing'], cover: photo('eggshell', 'Three thin white printed vessels with textured surfaces', 'A family of shells explores path-driven surface texture.'), gallery: [photo('eggshell-detail', 'Close-up of light shining through a ridged thin printed shell', 'The toolpath is visible in the thin material.')], sections: [{ title: 'Printing the pattern', text: 'Grasshopper generates G-code directly, allowing movement speed and extrusion quantity to be adjusted along the path. This independent object study is distinct from other research projects with the same name.' }], credits: ['Individual study and fabrication: Chia-Hsuan Chao.'],
  },
  {
    slug: 'f5', title: 'F5', subtitle: 'Machines choreograph a space.', category: 'XR & Interaction', year: '2019', context: 'DigitalFUTURES workshop / Tongji University & Stuttgart ITECH', location: 'Shanghai, China', role: 'Workshop participant · assembly, choreography & installation', summary: 'A collective workshop explores spatial choreography with bespoke mobile robotic systems.', premise: 'A group of small mobile machines becomes a way to study adaptable space and the relationship between robot movement and human interaction.', tags: ['Mobile robotics', 'Choreography', 'Workshop'], cover: photo('f5-robots', 'A group of bespoke wheeled robotic units arranged on the floor', 'Custom mobile machines developed within the collective workshop.'), gallery: [photo('f5-space', 'Fabric suspended in a spatial installation', 'Machine choreography is explored through a physical installation.')], sections: [{ title: 'Participating in a collective system', text: 'The week-long workshop led by Stuttgart ITECH involved assembly, choreography and installation. My participation sits within the group effort; it is not a claim to authorship of the complete robot platform.' }], credits: ['DigitalFUTURES 2019, CAUP Tongji University and Stuttgart ITECH workshop.', 'Tutors: Maria Yablonina and Samuel Leder. Group Stuttgart ITECH and workshop participants.'],
  },
]

export function findProject(slug: string) { return [...projects, ...lab].find(project => project.slug === slug) }
export function filterProjects(items: Project[], category: string, query: string) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  return items.filter(p => (category === 'All' || p.category === category) && words.every(word => `${p.title} ${p.summary} ${p.tags.join(' ')} ${p.role}`.toLowerCase().includes(word)))
}

export type Category = 'XR & Interaction' | 'Fabrication & Materials' | 'Architecture & Facades' | 'Generative Studies'
export type Media = { id: string; alt: string; caption: string; credit: string; fit?: 'contain' }
export type Section = { title: string; text: string; media?: string[] }
export type Project = {
  slug: string; title: string; subtitle: string; category: Category; year: string;
  context: string; location: string; role: string; summary: string; premise: string;
  tags: string[]; featured?: boolean; cover: Media; gallery: Media[];
  sections: Section[]; credits: string[]; links?: { label: string; url: string }[];
}

export const PROFILE = {
  "name": "JosHsuan",
  "fullName": "Chia-Hsuan Chao",
  "email": "chiahsuanchao@icloud.com",
  "github": "https://github.com/JosHsuan",
  "statement": "Research and professional projects in computational geometry, extended reality, material systems and fabrication."
}

export const categories: Category[] = ["XR & Interaction","Fabrication & Materials","Architecture & Facades","Generative Studies"]

export const projects: Project[] = [
  {
    "slug": "echoxr",
    "title": "EchoXR",
    "subtitle": "Collaborative VR for architectural acoustics",
    "category": "XR & Interaction",
    "year": "2024–25",
    "featured": true,
    "context": "Gramazio Kohler Research / ETH Zürich",
    "location": "Zürich, Switzerland",
    "role": "VR interaction, tracking, multiplayer integration & material rendering",
    "summary": "A multi-user VR research prototype combining architectural editing, spatial audio, hand interaction and motion tracking for acoustic design reviews.",
    "premise": "EchoXR investigates how acoustic decisions can be discussed while participants occupy the same virtual architectural model. Changes to partitions, surface materials and absorptive elements are experienced through both the appearance of the room and its sound. The project was developed at Gramazio Kohler Research and the ETH Design++ Immersive Design Lab in 2024–25.",
    "tags": [
      "Unity",
      "C#",
      "VR",
      "Spatial audio",
      "OptiTrack"
    ],
    "cover": {
      "id": "echo-shared",
      "alt": "Two participants exploring the same room with VR headsets",
      "caption": "Co-located participants reviewing an architectural model in VR.",
      "credit": "EchoXR / Gramazio Kohler Research"
    },
    "gallery": [
      {
        "id": "echo-room",
        "alt": "Virtual room with suspended acoustic panels and an in-world control interface",
        "caption": "Room configurations with acoustic panels and in-world controls.",
        "credit": "EchoXR / Gramazio Kohler Research"
      },
      {
        "id": "echo-gesture",
        "alt": "Virtual hands manipulating an audio source in the room",
        "caption": "Tracked hand interaction with a sound source in the virtual room.",
        "credit": "EchoXR / Gramazio Kohler Research"
      },
      {
        "id": "echo-setup",
        "alt": "Axonometric diagram of the tracking cameras and participants in the room",
        "caption": "Cameras, headsets and participants within the shared tracking volume.",
        "credit": "EchoXR / Gramazio Kohler Research",
        "fit": "contain"
      },
      {
        "id": "echo-palm-navigation",
        "alt": "EchoXR diagram showing hand gestures for teleportation, rotation and activation of a palm menu",
        "caption": "Hand gestures provide navigation and activate an in-world menu through the palm orientation.",
        "credit": "EchoXR / Gramazio Kohler Research",
        "fit": "contain"
      },
      {
        "id": "echo-integration-workflow",
        "alt": "EchoXR workflow diagram connecting Unity application setup, Photon networking and optical motion capture to multiple headset users",
        "caption": "Application setup, networking and optical motion capture connect to a shared multi-user headset environment.",
        "credit": "EchoXR / Gramazio Kohler Research",
        "fit": "contain"
      }
    ],
    "sections": [
      {
        "title": "Acoustic design within a shared model",
        "text": "The prototype places an architectural acoustic review inside a shared VR session. Participants can compare an open room, a room divided by walls and glazing, and a configuration using acoustic curtains. Desk, wall and ceiling panels can be enabled separately. These variations make the placement of acoustic treatment part of a spatial discussion rather than a separate set of numerical results. Participants' voices are processed through the virtual room, so conversation itself becomes a source for exploring its acoustic conditions.",
        "media": [
          "echo-room"
        ]
      },
      {
        "title": "Hand interaction and room controls",
        "text": "A palm-activated interface gives access to the room configuration without physical controllers. Turning the left palm toward the head reveals the menu; lowering or turning the hand dismisses it. A loading indicator and scaling animation communicate activation. Toggles control acoustic elements, while a dropdown selects room arrangements. Tracked hands also support teleportation, rotation and sound-source manipulation. The interface combines in-world controls with visible hands so that users can operate the model while maintaining a shared view of the room.",
        "media": [
          "echo-gesture",
          "echo-palm-navigation"
        ]
      },
      {
        "title": "Tracking in a shared physical space",
        "text": "Headset tracking and OptiTrack motion capture relate participants to the same physical environment. The setup uses headsets, headphones and microphones, with optical markers attached to the headset assemblies. Room scanning through Meta's Mixed Reality Utility Kit supplies local environmental information. A proximity-aware boundary system controls passthrough, the headset's live view of the physical room, and adjusts virtual-surface transparency as participants approach physical boundaries or one another. Participants can therefore see their surroundings during co-located use while retaining the virtual design context.",
        "media": [
          "echo-setup"
        ]
      },
      {
        "title": "Synchronizing participants and design changes",
        "text": "The Unity application separates continuous tracking from discrete design events. Photon Fusion synchronizes headset and hand representations, and shared object states carry changes such as enabling an acoustic panel. An interaction requests control of a shared object before changing its networked state. Photon Voice provides the communication stream; spatial audio places the voices and other sound sources within the virtual room. Steam Audio supplies the acoustic rendering, with surface settings for absorption, transmission and scattering associated with the room geometry.",
        "media": [
          "echo-integration-workflow"
        ]
      },
      {
        "title": "Implementation and contribution",
        "text": "My contribution focused on interactive elements and their integration into the VR system: hand-driven interface behavior, body and environment tracking, multiplayer state and tracking, and material rendering with Unity Shader Graph. Fabio Scotto led XR development and project coordination, while Achilleas Xydis led the acoustic research. Giacomo Montiani focused on integrating and optimizing the acoustic features. The work extended existing tracking, networking and audio frameworks within a collaborative research prototype.",
        "media": []
      },
      {
        "title": "Research demonstrator",
        "text": "EchoXR was presented in the IHIET 2025 paper “EchoXR: A Collaborative VR Framework for Spatial Acoustics in Architectural Design.” The prototype demonstrates shared architectural editing with auditory feedback. Further work concerns computational load, gesture onboarding, network consistency and integration with architectural modeling workflows.",
        "media": []
      }
    ],
    "credits": [
      "Gramazio Kohler Research, ETH Zürich. Project co-leads: Fabio Scotto and Achilleas Xydis. System implementation: Chia-Hsuan Chao and Giacomo Montiani.",
      "IHIET 2025 paper: Fabio Scotto, Chia-Hsuan Chao, Giacomo Montiani, Achilleas Xydis, Fabio Gramazio and Matthias Kohler; pp. 204–212.",
      "Research funding: ETH Foundation, with support from Andreas Weiss. Development and testing infrastructure: ETH Design++ Immersive Design Lab.",
      "Images: EchoXR project documentation / Gramazio Kohler Research. Tracking, networking and audio systems build on OptiTrack, Meta XR, Photon and Steam Audio."
    ],
    "links": [
      {
        "label": "ETH project overview",
        "url": "https://designplusplus.ethz.ch/research/concluded-projects/echo-xr.html"
      },
      {
        "label": "Research paper · IHIET 2025",
        "url": "https://doi.org/10.54941/ahfe1006713"
      }
    ]
  },
  {
    "slug": "xr-bending-active",
    "title": "XR-assisted Bending-Active Assembly",
    "subtitle": "Motion capture and adaptive XR assembly for bamboo structures",
    "category": "XR & Interaction",
    "year": "2024",
    "featured": true,
    "context": "MAS Architecture & Digital Fabrication / ETH Zürich",
    "location": "Zürich, Switzerland",
    "role": "Collaborative thesis · motion capture, adaptive geometry & XR assembly workflow",
    "summary": "A collaborative MAS thesis coupling physical bamboo deformation, parametric form finding and a mobile XR application for adaptive design and assembly.",
    "premise": "Bending-active bamboo changes shape during assembly, and its natural variation does not correspond exactly to a predetermined digital model. This thesis uses motion capture to bring the material's current posture and site conditions into an adaptive design workflow. A modular bamboo demonstrator tests how design parameters and assembly guidance can remain connected while the structure is being made.",
    "tags": [
      "COMPAS XR",
      "Motion capture",
      "Unity",
      "Grasshopper",
      "MQTT"
    ],
    "cover": {
      "id": "xr-structure",
      "alt": "Bending-active bamboo structure with connected curved modules",
      "caption": "Completed bamboo demonstrator assembled from woven modules.",
      "credit": "Project documentation / ETH MAS DFAB"
    },
    "gallery": [
      {
        "id": "xr-guidance",
        "alt": "A phone showing assembly guidance next to the physical bamboo module",
        "caption": "A mobile XR view relates assembly information to the bamboo module.",
        "credit": "Project documentation / ETH MAS DFAB"
      },
      {
        "id": "xr-assembly",
        "alt": "A participant assembling a bamboo module by hand",
        "caption": "Manual assembly and connection of the bamboo modules.",
        "credit": "Project documentation / ETH MAS DFAB"
      },
      {
        "id": "xr-form-finding-modules",
        "alt": "Adaptive bamboo design workflow from site planes and branch controls through a physics solver to Y-shaped woven modules",
        "caption": "Site planes and branch controls inform the adaptive model; Y-shaped modules convert its mesh into a strip-weaving pattern.",
        "credit": "Chia-Hsuan Chao and Wataru Nomura / ETH MAS DFAB",
        "fit": "contain"
      },
      {
        "id": "xr-cad-data-exchange",
        "alt": "Software diagram showing motion capture, adaptive CAD geometry, MQTT messages, Firebase storage and a Unity XR application",
        "caption": "Motion capture feeds the CAD model. MQTT carries updates and worker decisions, while Firebase stores project and assembly data.",
        "credit": "Chia-Hsuan Chao and Wataru Nomura / ETH MAS DFAB",
        "fit": "contain"
      }
    ],
    "sections": [
      {
        "title": "Adaptive form finding",
        "text": "Design configuration begins by recognizing wall planes to establish the spatial reference. Foundation points and the intersections of the branching structure can then be repositioned. Branch length and radius remain editable as the physics-based model adjusts to these conditions. The mobile interface exposes these parameters on site, allowing the worker to change the digital proposal while viewing it in relation to the physical space. Curvature, structural geometry, material requirements and site information inform the configuration before it is divided into assembly units.",
        "media": []
      },
      {
        "title": "From a global form to woven modules",
        "text": "The workflow combines form finding with form conversion. Once a global shape is established, it is divided into Y-shaped units. Grouping the module mesh produces a strip-weaving pattern that can be made with bamboo rods. The modular system connects a continuously curved design to smaller assemblies that workers can manipulate, track and join. Design configuration and module assembly remain separate operations within the same application, so changes to the overall structure can be considered alongside the construction of an individual unit.",
        "media": [
          "xr-form-finding-modules"
        ]
      },
      {
        "title": "Motion capture and spatial registration",
        "text": "The demonstrator uses ten OptiTrack cameras and passive markers to relate physical movement to the digital model. Tracking fixtures define planes, position points and circular radius controls; QR markers register the design in physical space. Module assembly starts by marking the bottom rod, selecting the module number and attaching markers to the current rod. The application overlays the tracked rod posture and target module geometry, while a larger display mirrors the phone screen for shared observation.",
        "media": [
          "xr-guidance"
        ]
      },
      {
        "title": "Data exchange between CAD and XR",
        "text": "Rhino and Grasshopper calculate adaptive geometry, while Unity provides the mobile interface. The software extends COMPAS XR with real-time geometry, configuration and assembly data. JSON, a text-based data format, represents rod curves and meshes as numerical points, vertices, faces and colors that Unity reconstructs in C#. The MQTT messaging protocol uses an EMQX server to carry motion measurements, interface triggers and worker requests between CAD and the application. Firebase stores the project geometry, configuration and assembly state, allowing the model and task progress to be retained between updates.",
        "media": [
          "xr-cad-data-exchange"
        ]
      },
      {
        "title": "Assembly guidance and demonstration",
        "text": "The mobile application supports module and rod selection, live tracking, design previews and step-by-step assembly visualization. Workers can compare a rod's current deformation with the module geometry and request the next piece through the interface. Physical trials cover parameter adjustment, fabrication of the woven modules and their manual connection into the bending-active structure. The completed bamboo demonstrator shows a working design-to-assembly loop in which the physical material supplies information to the model and the model supplies guidance to the worker.",
        "media": [
          "xr-assembly"
        ]
      },
      {
        "title": "Collaborative thesis",
        "text": "Developed with Wataru Nomura, the thesis brings together motion-capture integration, adaptive geometry, cross-platform data exchange and mobile XR interaction. It builds on the COMPAS and COMPAS XR research frameworks rather than treating the application as an independent tool. Alexandra Moisi and Prof. Daniela Mitterberger supervised the work within the MAS in Architecture and Digital Fabrication at ETH Zürich.",
        "media": []
      }
    ],
    "credits": [
      "Collaborative MAS thesis: Chia-Hsuan Chao and Wataru Nomura, ETH Zürich, 2024.",
      "Tutors: Alexandra Moisi and Prof. Daniela Mitterberger. MAS in Architecture and Digital Fabrication / ETH Zürich.",
      "Software research context: COMPAS and COMPAS XR; motion capture: OptiTrack; mobile XR development: Unity. Images: collaborative thesis documentation / ETH MAS DFAB."
    ],
    "links": []
  },
  {
    "slug": "metal-panels",
    "title": "Bending-Active Metal Panels",
    "subtitle": "Pattern-based form approximation for bending-active metal plates",
    "category": "Fabrication & Materials",
    "year": "2020 · paper 2023",
    "featured": true,
    "context": "Master’s thesis / National Cheng Kung University",
    "location": "Tainan, Taiwan",
    "role": "Individual thesis · computational method, material studies & prototypes",
    "summary": "Miura folding, a regression-based opening library and physical panel tests translate target curvature into cut-and-sewn metal plates.",
    "premise": "Bending-active plate design can begin with the deformation of a material or with a surface that the designer wants to construct. This individual master's thesis develops a form-approximation method between these two approaches. A Miura folding model represents local changes in surface direction; its folding angles are converted into openings in a metal plate, which bends when the openings are drawn together.",
    "tags": [
      "Bending-active",
      "Miura patterns",
      "Simulation",
      "Material testing"
    ],
    "cover": {
      "id": "metal-prototype",
      "alt": "Assembled curved metal panels forming a low architectural prototype",
      "caption": "The assembled bending-active metal-panel demonstrator.",
      "credit": "Chia-Hsuan Chao / project portfolio"
    },
    "gallery": [
      {
        "id": "metal-detail",
        "alt": "Close-up of perforated metal panels and their connections",
        "caption": "Panel openings, closure details and connections between adjacent plates.",
        "credit": "Chia-Hsuan Chao / project portfolio"
      },
      {
        "id": "metal-analysis",
        "alt": "Colored computational analysis across the target surface",
        "caption": "A geometric representation connects the proposed surface to panel behavior.",
        "credit": "Chia-Hsuan Chao / project portfolio",
        "fit": "contain"
      },
      {
        "id": "metal-form-approximation",
        "alt": "Four stages compare the origami surface, opening pattern, bending-active plate and curvature analysis.",
        "caption": "The target geometry is represented by an origami pattern, converted into plate openings and evaluated as a bending-active surface.",
        "credit": "Chia-Hsuan Chao / NCKU thesis documentation",
        "fit": "contain"
      },
      {
        "id": "metal-regression-calibration",
        "alt": "An opening length-width-angle library is shown beside angle measurement diagrams and sampled regression families.",
        "caption": "The calibration library relates opening dimensions to bending angles through measured fold geometry and sampled regression relationships.",
        "credit": "Chia-Hsuan Chao / NCKU thesis documentation",
        "fit": "contain"
      }
    ],
    "sections": [
      {
        "title": "A representation between form finding and form conversion",
        "text": "The workflow starts with a target surface and a Miura-based representation of its local surface flow. The folding model is fitted to that surface while retaining the crease relationships needed to measure local fold angles. A calibrated function library translates those angles into opening dimensions. The resulting pattern is converted into a plate mesh for a second simulation in which closing the openings produces the bending-active form. This separates the geometric representation of the desired shape from the elastic behavior of the plate that will make it.",
        "media": [
          "metal-form-approximation"
        ]
      },
      {
        "title": "Calibrating opening dimensions and bending angles",
        "text": "Paired openings were simulated to establish the relationship between opening length, opening width and deformation angle. An initial 60 mm opening length was tested with widths increasing from 0 to 50 mm in 1 mm steps. The study then increased opening length from 70 to 160 mm in 10 mm steps. Linear regression turned the sampled angle-width relationships into a function library spanning the three parameters, allowing opening dimensions and folding angles to be converted in both directions.",
        "media": [
          "metal-regression-calibration"
        ]
      },
      {
        "title": "Simulating the sewn plate",
        "text": "The origami representation is rebuilt as an elastic mesh by adding vertices within the original faces and defining the edges around each opening. Pairs of vertices on opposing opening edges are constrained to coincide, representing the sewing operation. Mesh subdivision provides the resolution for the dynamic simulation, and elasticity is reintroduced to evaluate the deformed plate. Curvature analysis and the simulated result are compared with physical mock-ups before the pattern is used in the assembled installation.",
        "media": []
      },
      {
        "title": "Arc, twist and saddle studies",
        "text": "The method was examined through arc, twist and saddle configurations. In the arc studies, peak openings required larger angle and width values than valley openings, while paired openings perpendicular to the bending direction shared the same value. Twisting reversed the relationship between peak and valley pairs. Saddle studies combined arc-like behavior in one direction with opening values that decreased from the center outward in the other. Comparisons between unit patterns, simulated surfaces and physical models made these relationships visible and informed subsequent changes to opening width and length.",
        "media": [
          "metal-analysis"
        ]
      },
      {
        "title": "Panel connections and spatial demonstrator",
        "text": "The final demonstrator combined the three curvature conditions in a structure approximately 3.3 m long, 2.6 m wide and 0.7 m high. Sixteen panels measured 90 by 60 cm each. Three pairs of holes beside each opening allowed its edges to be drawn together with fixed-size plastic bands and rivets; separate joints connected neighboring panels. Two people assembled the prototype over three days, and the unassembled panels were transported in a 60 by 35 by 35 cm bag. The prototype demonstrates the connection between the cut pattern, local closure and global form, while retaining a designer-defined panel boundary.",
        "media": [
          "metal-detail"
        ]
      },
      {
        "title": "Research contribution and publication",
        "text": "Chia-Hsuan Chao developed the computational representation, calibration studies, physical tests and demonstrator as an individual thesis supervised by Kane Yanagawa. The research was subsequently published with Yanagawa in CAADRIA 2023 under the title Bending-Active Metal Panel Deformation: Control through Computational Simulation and Pattern Development. The publication presents the work as a form-approximation strategy supported by prototype and fabrication experiments.",
        "media": []
      }
    ],
    "credits": [
      "Individual master's thesis: Chia-Hsuan Chao. Supervisor: Prof. Kane Yanagawa. Department of Architecture, National Cheng Kung University, Tainan, Taiwan.",
      "Publication: Chia-Hsuan Chao and Kane Yanagawa, CAADRIA 2023, volume 2, pp. 201-210. DOI: 10.52842/conf.caadria.2023.2.201.",
      "Images and diagrams: Chia-Hsuan Chao / project portfolio."
    ],
    "links": [
      {
        "label": "NCKU thesis record",
        "url": "https://thesis.lib.ncku.edu.tw/thesis/detail/e9eac9c2b822e64726474a184f9e5c1a/"
      },
      {
        "label": "CAADRIA 2023 paper",
        "url": "https://doi.org/10.52842/conf.caadria.2023.2.201"
      },
      {
        "label": "NCKU publication record",
        "url": "https://researchoutput.ncku.edu.tw/en/publications/bending-active-metal-panel-deformation-control-through-computatio/"
      }
    ]
  },
  {
    "slug": "caschlatsch",
    "title": "Caschlatsch",
    "subtitle": "Parametric timber construction and XR-guided assembly",
    "category": "Fabrication & Materials",
    "year": "2024",
    "featured": true,
    "context": "ETH MAS DFAB / Gramazio Kohler Research",
    "location": "Disentis/Mustér, Switzerland",
    "role": "Team project · COMPAS XR multi-module and stacking interfaces",
    "summary": "A full-scale timber installation connecting voxel-based beam aggregation, robotic production and mobile XR guidance for module assembly.",
    "premise": "Caschlatsch is an 8.4-metre timber structure erected at the ruins of a former castle above Disentis/Mustér. Developed by the ETH MAS DFAB 2023–24 cohort with Gramazio Kohler Research and local partners, the project tests a construction workflow in which people retain control while robotic tools and augmented reality support the positioning and assembly of a complex timber system.",
    "tags": [
      "Timber",
      "COMPAS",
      "XR assembly",
      "Parametric design"
    ],
    "cover": {
      "id": "caschlatsch-built",
      "alt": "Timber tower suspended above a rocky wooded site in Disentis",
      "caption": "The completed Caschlatsch timber installation at Disentis/Mustér.",
      "credit": "Project documentation / ETH MAS DFAB"
    },
    "gallery": [
      {
        "id": "caschlatsch-model",
        "alt": "Architectural model of the timber tower and its topographic site",
        "caption": "Physical model of the timber aggregation and its topographic site.",
        "credit": "Project documentation / ETH MAS DFAB",
        "fit": "contain"
      },
      {
        "id": "caschlatsch-joint",
        "alt": "Close-up of timber members meeting inside the installation",
        "caption": "Timber joints and intersecting beams inside the assembled installation.",
        "credit": "Project documentation / ETH MAS DFAB"
      },
      {
        "id": "caschlatsch-voxel-beams",
        "alt": "Caschlatsch voxel-to-beam diagram showing spatial occupancy checks and individual beam directions within a timber module",
        "caption": "Voxel occupancy and discrete beam directions organize the timber aggregation and its intersections.",
        "credit": "Caschlatsch / ETH MAS DFAB",
        "fit": "contain"
      },
      {
        "id": "caschlatsch-module-interface",
        "alt": "Mobile XR interface sequence showing module selection, beam isolation and orientation controls in stacking and assembly modes",
        "caption": "Module switching, beam isolation and orientation controls support stacking and assembly tasks.",
        "credit": "Chia-Hsuan Chao / COMPAS XR / ETH MAS DFAB",
        "fit": "contain"
      }
    ],
    "sections": [
      {
        "title": "Voxel-based beam aggregation",
        "text": "A Python and Grasshopper workflow organizes the timber aggregation through spatial voxels. An indexing system records each voxel and its neighbors, while discrete vectors define possible beam directions. Voxel, beam and layer objects connect local geometry to the larger assembly. A 26-direction system converts the spatial grid into members passing through voxel centers. Stored occupancy information checks existing beams and limits repeated intersections, giving the aggregation explicit geometric rules instead of an unconstrained accumulation of sticks.",
        "media": [
          "caschlatsch-voxel-beams"
        ]
      },
      {
        "title": "Modules and structural infill",
        "text": "Module frames define the initial edges of the system. Orthogonal and diagonal members reinforce those frames, and additional beam infill varies the density within each unit. Studies compare sparse five-beam and denser thirty-beam infill arrangements. The modules are composed into the tower in relation to the site topography. Architectural models connect the aggregation rules, the internal stair and the installation's position on the former castle foundations.",
        "media": [
          "caschlatsch-model"
        ]
      },
      {
        "title": "Fabrication data and assembly plans",
        "text": "COMPAS Timber carries beam and joint information into an assembly plan. Building plans, QR reference frames, checklists and project settings are exported as JSON, with OBJ meshes supplying the visual geometry. Firebase provides the shared storage from which the mobile applications fetch these modules. The applications reconstruct the design in augmented reality and retain information about selected beams and assembly status. This connects the design model to the particular module being prepared in the workshop.",
        "media": []
      },
      {
        "title": "My contribution to the XR interfaces",
        "text": "During production, I extended COMPAS XR to manage multiple modules. Workers could select a module from the cloud, switch between modules, identify the current beam and follow its sequence step. I also developed controls for the stacking application: orientation arrows, beam isolation for inspecting cutting features, module scaling and rotation, and switching between stacking and assembly views. Information panels expose the selected beam and module rather than requiring workers to infer these identities from geometry alone. The interfaces support locating and checking components before and during assembly.",
        "media": [
          "caschlatsch-module-interface"
        ]
      },
      {
        "title": "Human–robot production and on-site installation",
        "text": "The timber modules were assembled through a collaborative workshop process using robotic positioning and human construction. XR visualization provided a reference for comparing the physical assembly with the digital plan. The completed modules were transported to the site and lifted into position by helicopter. Joints connect densely interwoven timber members around an internal stair, and the completed installation stands on the rocky site. Caschlatsch opened to visitors in September 2024 as a temporary structure accessible to hikers.",
        "media": [
          "caschlatsch-joint"
        ]
      }
    ],
    "credits": [
      "Collective design and construction: ETH MAS DFAB 2023–24 cohort and Gramazio Kohler Research, ETH Zürich. Chia-Hsuan Chao participated as a cohort member and developed the multi-module and stacking XR features described here.",
      "Project lead: Petrus Aejmelaeus-Lindström. Research lead: Oliver Bucklin. Tutors: Ananya Kango, Simon Griffioen and Petrus Aejmelaeus-Lindström. Professors: Fabio Gramazio and Matthias Kohler.",
      "Local collaboration: #dfdu AG, Studio UH Architects ETH SIA and Nicolas Fehlmann Ingénieurs Conseils SA. Client: Gemeinde Disentis/Mustér. Full research, student, expert and sponsor credits are listed on the official project page.",
      "Images: Caschlatsch project documentation / ETH MAS DFAB and Gramazio Kohler Research."
    ],
    "links": [
      {
        "label": "Official project and full team credits",
        "url": "https://gramaziokohler.arch.ethz.ch/web/lehre/e/0/0/0/496.html"
      },
      {
        "label": "Project context · NCCR Digital Fabrication",
        "url": "https://dfab.ch/news/caschlatsch-demonstrator-a-symbiosis-of-tradition-and-innovation-craftsmanship-and-technology"
      },
      {
        "label": "Opening · September 2024",
        "url": "https://dfab.ch/news/opening-of-caschlatsch"
      }
    ]
  },
  {
    "slug": "nanshan-installation",
    "title": "Nan Shan Entrance Installation",
    "subtitle": "Folded-aluminum panelization and fabrication",
    "category": "Architecture & Facades",
    "year": "2021",
    "featured": true,
    "context": "PKD Engineering Consultants",
    "location": "Taichung, Taiwan",
    "role": "Scheme development, 3D modeling & fabrication drawings",
    "summary": "A computational panel system translates a curved entrance installation into 600 folded aluminum components, fabrication drawings and three prefabricated modules.",
    "premise": "Commissioned by Fu Tsu Construction for Taichung Nan Shan no.6 Square, the entrance installation was developed by a three-person team over three months. The approximately eight-metre-high work stands near Taichung railway station. Its design development connected a continuous architectural surface with the size limits, folding operations and assembly practices of a local aluminum fabricator.",
    "tags": [
      "Panelization",
      "Aluminum",
      "Rhino",
      "Fabrication drawings"
    ],
    "cover": {
      "id": "installation-built",
      "alt": "Curved aluminum entrance installation against the blue sky",
      "caption": "Folded panels and openings articulate the completed entrance.",
      "credit": "Project documentation / PKD Engineering Consultants"
    },
    "gallery": [
      {
        "id": "installation-process",
        "alt": "Four stages developing the installation from a smooth surface to a perforated panel system",
        "caption": "The scheme develops from a continuous surface into a panel system.",
        "credit": "Project documentation / PKD Engineering Consultants",
        "fit": "contain"
      },
      {
        "id": "installation-panels",
        "alt": "Close-up of triangular folded aluminum panels",
        "caption": "Panel folds and openings give the surface depth.",
        "credit": "Project documentation / PKD Engineering Consultants"
      },
      {
        "id": "installation-assembly",
        "alt": "Workers assembling a segment of the aluminum installation in a workshop",
        "caption": "Fabrication information supports workshop assembly.",
        "credit": "Project documentation / PKD Engineering Consultants"
      },
      {
        "id": "installation-opening-schemes",
        "alt": "Four alternative folded-aluminum opening patterns on the same curved installation geometry",
        "caption": "Alternative panel-opening schemes evaluated on the same installation geometry.",
        "credit": "Project documentation / PKD Engineering Consultants",
        "fit": "contain"
      },
      {
        "id": "installation-panel-joints",
        "alt": "Exploded detail views of three-lug and two-lug aluminum panel connections on a curved pipe support",
        "caption": "Three-lug and two-lug panel connections on curved pipe supports.",
        "credit": "Project documentation / PKD Engineering Consultants",
        "fit": "contain"
      }
    ],
    "sections": [
      {
        "title": "Surface subdivision and opening patterns",
        "text": "The geometry began as a NURBS surface. Triangular subdivision was sized around the fabricator's working limits, and controlled panel depth gave the surface its relief. A helix curve provided a reference for the openings: distances between the curve and the panel centres were used to vary the apertures across the installation. Several pattern schemes were prepared for the client. The studies also considered access to the internal lighting for maintenance and the position of openings in relation to child safety.",
        "media": [
          "installation-process",
          "installation-opening-schemes"
        ]
      },
      {
        "title": "Panel joints and fabrication drawings",
        "text": "The assembly uses panels with two or three connection lugs, suspended from modular hangers. Lug geometry accommodates the fixed depth of the connecting components. Panels are organized in pairs, with fixing holes between them and alignment holes in their upper and lower lugs. The fabrication drawings translate these relationships into unfolded profiles, fold lines, folding angles and checking dimensions. Laser-cut profiles were then folded and assembled by the fabricator; the geometric differences between panels had to remain legible in information used for manual work.",
        "media": [
          "installation-panels",
          "installation-panel-joints"
        ]
      },
      {
        "title": "A common reference for three support layers",
        "text": "The installation combines the folded panels, a curved steel-pipe support layer, and a steel beam-and-column framework. Pipes of different radii locate the panels, while the framework positions the pipes. A fixed reference surface coordinates these layers: intersecting it with horizontal planes establishes the pipe centre curves used to locate the components. The larger-radius module includes additional bracing in the structural system. The common geometric reference allowed the detailed drawings to describe the relationships between supports, hangers and cladding consistently.",
        "media": []
      },
      {
        "title": "Prefabrication and transport",
        "text": "The work was divided into modules A, B and C to accommodate truck dimensions and the roads leading to the site. Each module was assembled and painted in the factory before transport, reducing the amount of assembly work in the busy commercial district. Factory fabrication did not require scaffolding.",
        "media": [
          "installation-assembly"
        ]
      },
      {
        "title": "Contribution and completed work",
        "text": "At PKD Engineering Consultants, I worked on scheme development, 3D modeling and fabrication drawings. Zhi-Yu Guo worked on the 2D drawing sector and Monita on the structural sector. My contribution centred on the two-way translation between the 3D panel system and the 2D information used to fabricate it. The completed installation contains 600 aluminum panels with varying openings, realized through factory fabrication and manual assembly.",
        "media": []
      }
    ],
    "credits": [
      "Facade and installation development: PKD Engineering Consultants. Employer: Peter Chen. Commissioned by Fu Tsu Construction.",
      "Collaboration: Zhi-Yu Guo (2D drawing sector) and Monita (structural sector). Scheme development, 3D modeling and fabrication drawings: Chia-Hsuan Chao.",
      "Images and drawings: the owner's project portfolio / PKD project documentation."
    ]
  },
  {
    "slug": "heat-rotate-cutting",
    "title": "Heat Rotate Cutting",
    "subtitle": "A custom rotary heat-cutting machine for polystyrene brick systems",
    "category": "Fabrication & Materials",
    "year": "2018",
    "featured": true,
    "context": "Mode/s of Making / National Cheng Kung University",
    "location": "Tainan, Taiwan",
    "role": "Studio project · machine development, toolpaths & material experiments",
    "summary": "A custom Arduino-controlled machine combines planar heat-cutting paths with material rotation to fabricate individually numbered polystyrene bricks.",
    "premise": "Heat Rotate Cutting investigates how the mechanism of a fabrication tool can shape the design process. The studio project developed a rotary heat-cutting machine and a digital workflow for a wall of customized polystyrene bricks. Geometry, machine motion and the texture left by cutting were studied together, rather than treating fabrication as a final translation of a completed model.",
    "tags": [
      "Arduino",
      "Marlin",
      "Machine making",
      "Toolpaths"
    ],
    "cover": {
      "id": "heat-machine",
      "alt": "Custom cutting machine next to a fabricated cellular foam prototype",
      "caption": "Rotary heat-cutting apparatus and polystyrene brick prototype.",
      "credit": "Project archive / photography includes Jan Kyselý"
    },
    "gallery": [
      {
        "id": "heat-material",
        "alt": "Close-up of a carved foam surface with flowing ridges",
        "caption": "Surface ridges resulting from the heated cutting trajectory.",
        "credit": "Jan Kyselý / project archive"
      },
      {
        "id": "heat-detail",
        "alt": "Blue mechanical component mounted on the machine frame",
        "caption": "Custom mechanical components in the cutter carriage and frame.",
        "credit": "Jan Kyselý / project archive"
      },
      {
        "id": "heat-corexy-system",
        "alt": "Machine diagram connects the heated cutter, CoreXY carriage, controller, endstop, rotary mechanism and adjustable holder.",
        "caption": "The machine combines planar cutter movement with workpiece rotation, an adjustable holder and endstop positioning.",
        "credit": "Chia-Hsuan Chao / Mode/s of Making project documentation",
        "fit": "contain"
      },
      {
        "id": "heat-toolpath-textures",
        "alt": "Polystyrene samples show ridges left by the cutting path and their relationship to assembled brick openings.",
        "caption": "Physical samples record the surface texture left by the cutting paths and the meeting edges of neighboring bricks.",
        "credit": "Jan Kyselý (Fig. 4-09 and Fig. 4-10); remaining figures from project documentation",
        "fit": "contain"
      }
    ],
    "sections": [
      {
        "title": "Geometry, toolpaths and fabrication data",
        "text": "The workflow connects five stages: geometry development, cutting-path optimization, conversion to G-code, machine-controlled fabrication and assembly using the simulated model. A digitally defined cellular wall is divided into bricks whose circular cut surfaces continue across neighboring units. Arduino control and a modified Marlin framework translate the optimized paths into machine movement, allowing cutting speed, path depth and rotation to be developed alongside the geometry.",
        "media": []
      },
      {
        "title": "Planar motion and material rotation",
        "text": "An aluminum frame and custom 3D-printed components support two coordinated mechanisms. The planar CoreXY system uses two stepper motors to move the cutter through the XZ section plane; their matching or opposing rotation combines into the required carriage motion. A separate stepper motor rotates the workpiece about the Y axis, controlling which section is being cut. An adjustable holder accommodates different material sizes, and endstops establish the cutting position. The machine therefore changes both the section path and its position around the material.",
        "media": [
          "heat-detail",
          "heat-corexy-system"
        ]
      },
      {
        "title": "Customized bricks and assembly",
        "text": "Rotating cutting paths produce different circular surfaces in individual polystyrene blocks. The bricks are designed to meet smoothly and are tagged with their position in the assembly. Eight bricks form a larger unit, and those units combine into wall configurations with different openings and densities. Fabrication took approximately 10-15 minutes per brick in the illustrated setup.",
        "media": []
      },
      {
        "title": "Roughing, finishing and toolpath texture",
        "text": "Cutting was divided into a roughing pass and a slower finishing pass. Parallel paths with larger depth increments removed most of the material first; a continuous finishing path then refined the surface. While the initial design focused on a skeleton-like pattern and variations in its openings, the physical tests revealed another result: the finishing trajectory produced a distinct surface texture. This observation became part of the material study, connecting the visible ridges to the path and movement of the cutter rather than only to the intended overall form.",
        "media": [
          "heat-material",
          "heat-toolpath-textures"
        ]
      },
      {
        "title": "Studio contribution",
        "text": "The project brought together machine development, computational geometry, fabrication data and material experiments within the Mode/s of Making studio at National Cheng Kung University. Chia-Hsuan Chao developed the integrated design and fabrication study; Kane Yanagawa supervised the studio, and Jan Kyselý contributed photography.",
        "media": []
      }
    ],
    "credits": [
      "Studio project: Chia-Hsuan Chao. Tutor: Prof. Kane Yanagawa. Mode/s of Making, National Cheng Kung University, Tainan, Taiwan.",
      "Photography: Jan Kyselý where explicitly credited in the source portfolio; other images and diagrams from the project documentation."
    ]
  },
  {
    "slug": "v-shape-aggregation",
    "title": "V-Shape Modular Aggregation",
    "subtitle": "Reciprocal stick aggregation and collision-aware robotic assembly",
    "category": "Fabrication & Materials",
    "year": "2023",
    "context": "ETH MAS DFAB / Special Assemblies",
    "location": "Zürich, Switzerland",
    "role": "Collaborative project · aggregation logic & robotic assembly studies",
    "summary": "A bottom-up V-stick generator is connected to JSON-based assembly data, motion planning and small-scale robotic placement tests.",
    "premise": "The Special Assemblies project examines how reciprocal stick structures can be generated and assembled by a robotic arm. A pair of sticks forms a V-shaped module, and successive modules extend the spatial aggregation. Geometry generation, assembly order, gripper orientation and insertion trajectories are developed together because a valid geometric arrangement must also allow the robot to place each part.",
    "tags": [
      "Robotics",
      "COMPAS",
      "Python",
      "Assembly planning"
    ],
    "cover": {
      "id": "robotic-assembly",
      "alt": "Robot arm placing a timber stick into a small spatial structure",
      "caption": "The assembly rule is tested at the robotic workcell.",
      "credit": "Project documentation / ETH MAS DFAB"
    },
    "gallery": [
      {
        "id": "robotic-sequence",
        "alt": "Diagram of a robot arm positioning a stick beside an aggregated structure",
        "caption": "A planned placement connects geometric rules to robot movement.",
        "credit": "Project documentation / ETH MAS DFAB",
        "fit": "contain"
      },
      {
        "id": "robotic-prototype",
        "alt": "Completed stick aggregation beside a robotic arm",
        "caption": "The physical prototype makes the assembly sequence visible.",
        "credit": "Project documentation / ETH MAS DFAB"
      },
      {
        "id": "vstick-motion-data",
        "alt": "JSON planning diagram carries assembly parts and attributes into pick, place, exit and insert trajectories, with failed-index replanning.",
        "caption": "JSON assembly data defines trajectory stages and retains a failed index for targeted replanning.",
        "credit": "Chia-Hsuan Chao, Kevin Seav and Megi Sinani / ETH MAS DFAB",
        "fit": "contain"
      },
      {
        "id": "vstick-frame-correction",
        "alt": "Two aggregation diagrams compare stick frames before and after height sorting, configuration selection and Z-axis correction.",
        "caption": "Height ordering and corrected gripper frames address placement sequence and clearance at the worktable.",
        "credit": "Chia-Hsuan Chao, Kevin Seav and Megi Sinani / ETH MAS DFAB",
        "fit": "contain"
      }
    ],
    "sections": [
      {
        "title": "Bottom-up module generation",
        "text": "Observed aggregation behaviors were organized into four directional categories: northeast, northwest, southeast and southwest. An object-oriented model distinguishes individual sticks from V-stick modules. One operation creates a module from two sticks; another generates its successor using the preceding module and selected parameters. A directional toggle changes the geometric references and orientations used to create the next pair. Studies of these combinations show how a local reciprocal relationship produces different larger aggregations.",
        "media": [
          "robotic-prototype"
        ]
      },
      {
        "title": "Assembly information and motion planning",
        "text": "A COMPAS assembly organizes each part with its shape, axis and coordinate frame, which describes its position and orientation. Assembly attributes include part count and safe frames chosen for movement between operations. JSON, a text-based data format, carries this information from aggregation generation to trajectory planning. ROS (Robot Operating System) and MoveIt provide the tools to plan and simulate robot movement. Trajectories are structured into pick, insert, place and exit stages, each described by a sequence of positions and orientations between approach, pickup, safe and placement locations.",
        "media": [
          "vstick-motion-data"
        ]
      },
      {
        "title": "Sequencing, frame correction and replanning",
        "text": "Sticks are ordered by height within each module, and candidate configurations are checked for collisions. The tool-center-point frame describes the gripper's position and orientation. Its Z axis indicates the gripper direction, and an upward-facing frame can bring the gripper into the worktable. A correction checks the Z component of this axis and flips the frame when required. If a planned movement fails, its step index is retained so that the corresponding trajectory can be replanned and exported without regenerating the entire sequence. These checks address the relationship between abstract stick geometry and the physical robot's clearance.",
        "media": [
          "vstick-frame-correction"
        ]
      },
      {
        "title": "Robotic demonstrator and collaboration",
        "text": "The small-scale demonstrator tested the generated structure through robot-assisted stick placement, starting with the foundation setup and progressing through pickup and insertion of successive sticks. Chia-Hsuan Chao, Kevin Seav and Megi Sinani developed the aggregation and robotic workflow collaboratively within ETH MAS DFAB in 2023.",
        "media": [
          "robotic-sequence"
        ]
      }
    ],
    "credits": [
      "Collaborative project: Chia-Hsuan Chao, Kevin Seav and Megi Sinani. Special Assemblies, ETH MAS Architecture and Digital Fabrication, 2023.",
      "Tutors: Ananya Kango, Simon Griffioen and Petrus Aejmelaeus-Lindström.",
      "Images and diagrams: project documentation / ETH MAS DFAB."
    ]
  },
  {
    "slug": "non-planar-printing",
    "title": "Dot-Based Non-Planar Printing",
    "subtitle": "Parameter studies in dot-based deposition and non-planar toolpaths",
    "category": "Fabrication & Materials",
    "year": "2023",
    "context": "ETH MAS DFAB / Printing Architecture",
    "location": "Zürich, Switzerland",
    "role": "Collaborative project · print parameters, toolpath studies & physical samples",
    "summary": "Layer spacing, sampling density, robot movement and time delays are varied to develop printed textures and apply them to more complex forms.",
    "premise": "The Printing Architecture project studies the deposition path as a means of designing the surface of a printed object. It begins with small samples that isolate printing parameters, then transfers the resulting rules to curved and twisting geometries. The aim is to understand how local dot patterns and continuous paths change when they are applied to a larger form.",
    "tags": [
      "3D printing",
      "G-code",
      "Non-planar paths",
      "Material studies"
    ],
    "cover": {
      "id": "printing-object",
      "alt": "White twisting non-planar printed object photographed outdoors in snow",
      "caption": "A continuous printed object emerges from the deposition strategy.",
      "credit": "Chia-Hsuan Chao / ETH MAS DFAB"
    },
    "gallery": [
      {
        "id": "printing-samples",
        "alt": "A collection of blue and white printed material samples",
        "caption": "Parameter variations are compared through a family of physical samples.",
        "credit": "Chia-Hsuan Chao / ETH MAS DFAB",
        "fit": "contain"
      },
      {
        "id": "printing-parameter-matrix",
        "alt": "A matrix of twelve printed rings sits beside layer-height, density, number, textile-length, delay-height and velocity parameters.",
        "caption": "Small printed samples compare changes to slicing, pattern subdivision, delay and movement parameters.",
        "credit": "Chia-Hsuan Chao and Namdev Talluru / ETH MAS DFAB project documentation",
        "fit": "contain"
      },
      {
        "id": "printing-deposition-strategies",
        "alt": "Three deposition-path diagrams are paired with ring samples and close-up photographs of their resulting textures.",
        "caption": "Changes to movement and programmed delay produce different deposition patterns in the ring studies.",
        "credit": "Chia-Hsuan Chao and Namdev Talluru / ETH MAS DFAB project documentation",
        "fit": "contain"
      }
    ],
    "sections": [
      {
        "title": "A parameter matrix for printed texture",
        "text": "Physical samples compare variations in layer height, density, pattern subdivisions, pattern length, delay height and movement velocity. Each print layer is sampled into toolpath positions; their number is derived from the path length and the selected subdivision and density settings. Changing these values alters the spacing and distribution of deposited material. The parameter matrix compares printing instructions with the resulting rings and close-up surfaces.",
        "media": [
          "printing-samples",
          "printing-parameter-matrix"
        ]
      },
      {
        "title": "Continuous paths and dotted deposition",
        "text": "The study compares continuous, smooth sections with dotted and segmented patterns. Delay-height settings organize the transition between these modes, while changes to robot movement and programmed time delays produce different local textures. Path diagrams and ring samples make the deposition strategies explicit before they are used on a more complex geometry.",
        "media": [
          "printing-deposition-strategies"
        ]
      },
      {
        "title": "Transferring the rule to changing geometry",
        "text": "The established printing rules were applied to a series of larger forms, including curved and twisting objects. The geometry studies compare how the same local pattern behaves as the overall shape changes, examining both its adaptability and its limitations. The resulting objects, including TPU demonstrators, vary in texture and translucency.",
        "media": []
      },
      {
        "title": "Project contribution",
        "text": "Chia-Hsuan Chao and Namdev Talluru developed the parameter, toolpath and physical-sample studies as a collaborative term-one project in ETH MAS DFAB in 2023.",
        "media": []
      }
    ],
    "credits": [
      "Collaborative project: Chia-Hsuan Chao and Namdev Talluru. Printing Architecture, ETH MAS Architecture and Digital Fabrication, 2023.",
      "Tutors: Ananya Kango, Simon Griffioen and Petrus Aejmelaeus-Lindström.",
      "Photography: Chia-Hsuan Chao where credited in the source portfolio; other process images and diagrams from ETH MAS DFAB project documentation."
    ]
  },
  {
    "slug": "inside-out",
    "title": "Inside Out",
    "subtitle": "Form finding and weighted mesh segmentation of a Split P surface",
    "category": "Fabrication & Materials",
    "year": "2019",
    "context": "IDF 2019 / National Yunlin University of Science and Technology",
    "location": "Yunlin, Taiwan",
    "role": "Workshop study · mesh design & collaborative prototype assembly",
    "summary": "A constrained form-finding model is divided into weighted panel groups, unrolled within laser-cutting limits and assembled as a small workshop prototype.",
    "premise": "Inside Out examines how a complex mathematical surface can be developed into a set of fabricable panels. The study was produced during the five-day IDF 2019 workshop at the Idea Factory, National Yunlin University of Science and Technology. Grasshopper, Kangaroo and Ivy supported a workflow connecting form finding, mesh analysis, differential tiling and prototype assembly.",
    "tags": [
      "Grasshopper",
      "Kangaroo",
      "Ivy",
      "Mesh analysis"
    ],
    "cover": {
      "id": "inside-out",
      "alt": "Perforated white assembled shell displayed inside a workshop",
      "caption": "A tiled prototype translates the surface into discrete parts.",
      "credit": "Chia-Hsuan Chao"
    },
    "gallery": [
      {
        "id": "inside-out-workshop",
        "alt": "Workshop exhibition with a large assembled arch and small study prototypes",
        "caption": "The study sits within the wider collaborative IDF workshop.",
        "credit": "Chia-Hsuan Chao"
      },
      {
        "id": "inside-split-p-geometry",
        "alt": "The Split P surface equation is displayed above a sequence of related shell geometries.",
        "caption": "The Split P surface provides the starting geometry for the workshop form-finding study.",
        "credit": "Chia-Hsuan Chao / IDF 2019 workshop documentation",
        "fit": "contain"
      },
      {
        "id": "inside-weighted-segmentation",
        "alt": "A custom-weight diagram lists Kruskal-valence, Dijkstra, Prim and multiroot edge-weight alternatives for mesh segmentation.",
        "caption": "Custom weights and alternative graph methods were studied to divide the mesh into fabrication-sized panels.",
        "credit": "Chia-Hsuan Chao / IDF 2019 workshop documentation",
        "fit": "contain"
      }
    ],
    "sections": [
      {
        "title": "Constrained form finding",
        "text": "The initial geometry is a Split P surface. Its longest boundary is constrained to a plane during form finding, while the target lengths of the mesh edges are set to 1.2 times their initial lengths. Laplacian smoothing regularizes local vertex positions in the developing mesh. Boundary constraints, edge-length targets and smoothing therefore change the starting surface before it is divided into parts.",
        "media": [
          "inside-split-p-geometry"
        ]
      },
      {
        "title": "Weighted segmentation and unrolling",
        "text": "Mesh segmentation was studied through graph-based alternatives and custom weights. The workflow includes weighted spanning-tree approaches and compares different ways of splitting the mesh. The objectives are to limit the number of panels and curvature variation within each panel while keeping every segment within the laser cutter's working size. Selected groups are split from the mesh, unrolled into flat fabrication layouts and prepared for assembly. The drawings connect the segmented surface to its corresponding cut parts.",
        "media": [
          "inside-weighted-segmentation"
        ]
      },
      {
        "title": "Prototype and workshop contribution",
        "text": "The resulting small prototype demonstrates the segmented surface through a physical panel assembly. Chia-Hsuan Chao developed the individual mesh study and worked with Kenta Saito on prototype assembly. This two-person exercise occupied the first two days of the workshop; the remaining three days were devoted to collective work by the full IDF 2019 group. The small study was exhibited alongside the larger collective workshop structure.",
        "media": [
          "inside-out-workshop"
        ]
      }
    ],
    "credits": [
      "Individual study: Chia-Hsuan Chao. Prototype assembly collaboration: Kenta Saito. Wider group work: IDF 2019 workshop participants.",
      "Tutor: Prof. Chung-Han Lee. Idea Factory, National Yunlin University of Science and Technology, Yunlin, Taiwan, 2019.",
      "Photography: Chia-Hsuan Chao. Digital diagrams and physical model documentation from the project portfolio."
    ]
  },
  {
    "slug": "kaohsiung-terminal",
    "title": "Kaohsiung Port Terminal · Lobe-D",
    "subtitle": "Lobe-D facade interfaces and fabrication drawings",
    "category": "Architecture & Facades",
    "year": "Professional practice",
    "context": "PKD Engineering Consultants",
    "location": "Kaohsiung, Taiwan",
    "role": "Lobe-D interface coordination, facade system setup & fabrication-drawing conversion",
    "summary": "Facade coordination resolves the tail of Lobe-D and selected west and south elevations through a classified 3D system and semi-automated fabrication drawings.",
    "premise": "For the Kaohsiung Port Passenger Terminal, PKD Engineering Consultants worked as facade and structural consultant to Chun Yuan Construction. The architecture was developed by Reiser + Umemoto and Fei & Cheng Associates. My scope covered interface coordination and drawing conversion at the tail of Lobe-D, together with system setup and drawing conversion for the west and south facades from floors three to eight.",
    "tags": [
      "Rhino",
      "Grasshopper",
      "AutoCAD",
      "Facade coordination"
    ],
    "cover": {
      "id": "terminal-model",
      "alt": "Axonometric model of Lobe-D facade layers and selected interface scope",
      "caption": "The selected facade scope is shown within its structural context.",
      "credit": "Project documentation / PKD Engineering Consultants",
      "fit": "contain"
    },
    "gallery": [
      {
        "id": "terminal-detail",
        "alt": "Detailed facade interface model around a structural connection",
        "caption": "Interface modeling supports coordination between systems.",
        "credit": "Project documentation / PKD Engineering Consultants",
        "fit": "contain"
      },
      {
        "id": "terminal-frame",
        "alt": "Structural frame model for the Lobe-D section",
        "caption": "Layered models make the relationships between systems explicit.",
        "credit": "Project documentation / PKD Engineering Consultants",
        "fit": "contain"
      },
      {
        "id": "terminal-extrusion-output",
        "alt": "Lobe-D extrusion segmentation model beside the corresponding fabrication drawing set",
        "caption": "Extrusion segmentation linked to its fabrication drawings.",
        "credit": "Project documentation / PKD Engineering Consultants",
        "fit": "contain"
      },
      {
        "id": "terminal-panel-output",
        "alt": "Colored Lobe-D aluminum panel families beside their unfolded fabrication drawings",
        "caption": "Panel classification linked to folded-aluminum fabrication drawings.",
        "credit": "Project documentation / PKD Engineering Consultants",
        "fit": "contain"
      }
    ],
    "sections": [
      {
        "title": "Closing the four-sided interface",
        "text": "The tail of Lobe-D was the last portion to be constructed among the surrounding facades. Its closure had to integrate interfaces from all four adjacent sides. Although the elevation appears rectangular, its side lengths and angles vary slightly. The model therefore had to coordinate aluminum-panel joints and locate the curtain wall's structural connections against the main structure without assuming a regular rectangular frame.",
        "media": [
          "terminal-frame"
        ]
      },
      {
        "title": "Classifying layers and exceptions",
        "text": "The local system consists primarily of corner units, with inner and outer facade layers on all four sides. Waterproofing and structural requirements led to folded aluminum components of different shapes and sizes. Rhino and Grasshopper were used to establish the 3D geometry, classify the facade parts and handle exceptions to the typical system. Segmentation and subframe models coordinate the cladding, fixing plates and supporting members at the interface.",
        "media": [
          "terminal-detail",
          "terminal-panel-output"
        ]
      },
      {
        "title": "Transferring the model to the drawing team",
        "text": "Grasshopper supported semi-automated generation of AutoCAD Smart-Blocks from the geometric setup. The output was converted to AutoCAD format for the construction drawing team. This workflow connected the model's part classification with the panel, extrusion and subframe fabrication drawings, while allowing irregular conditions to be developed in the 3D model before the drawing information was coordinated.",
        "media": [
          "terminal-extrusion-output"
        ]
      },
      {
        "title": "Contribution",
        "text": "I coordinated the Lobe-D tail interfaces and converted their geometry into fabrication-drawing information, working with Wen-Ting You in the 2D sector. My scope also included system setup and drawing conversion for the west and south facades from floors three to eight.",
        "media": []
      }
    ],
    "credits": [
      "Architecture: Reiser + Umemoto and Fei & Cheng Associates. Facade and structural consultancy: PKD Engineering Consultants. Client: Chun Yuan Construction.",
      "Employer: Peter Chen. Collaboration: Wen-Ting You (2D drawing sector). Defined facade coordination and 3D-to-fabrication drawing work: Chia-Hsuan Chao.",
      "Models and fabrication drawings: the owner's project portfolio / PKD project documentation."
    ]
  },
  {
    "slug": "jinshan-church",
    "title": "Hyatt Jinshan Church",
    "subtitle": "Planar marble cladding on a double-curved envelope",
    "category": "Architecture & Facades",
    "year": "2021 · design study",
    "context": "PKD Engineering Consultants",
    "location": "Jinshan, Taiwan",
    "role": "Geometry optimization & marble facade-system development",
    "summary": "Geometry optimization and panel-proportion studies develop a flat-marble facade system within established architectural, fire-safety and HVAC interfaces.",
    "premise": "PKD Engineering Consultants joined the church project at Hyatt Regency Jinshan Resort after the construction permit had been obtained and the fire-safety and HVAC systems had been finalized. The facade consultancy had to retain those interfaces while developing cladding for the double-curved envelope. The use of flat marble panels made surface segmentation and the supporting system central to the design development.",
    "tags": [
      "Double curvature",
      "Marble",
      "Panel systems",
      "Rationalization"
    ],
    "cover": {
      "id": "church-model",
      "alt": "Axonometric model of a curved church envelope and its supporting structure",
      "caption": "Envelope geometry is coordinated with the supporting structure.",
      "credit": "Project documentation / PKD Engineering Consultants",
      "fit": "contain"
    },
    "gallery": [
      {
        "id": "church-detail",
        "alt": "Rear view of the facade model showing curved geometry and structural interfaces",
        "caption": "The facade is studied within fixed project interfaces.",
        "credit": "Project documentation / PKD Engineering Consultants",
        "fit": "contain"
      },
      {
        "id": "church-construction",
        "alt": "Construction photograph of a curved steel church structure",
        "caption": "The structural context of the facade study.",
        "credit": "Li Wei Mechanical Engineering Co., Ltd."
      },
      {
        "id": "church-planarization",
        "alt": "Diagrams showing nonplanar panels being planarized and the inward and outward deviations between adjacent flat panels",
        "caption": "Planarizing twisted panels produces inward or outward offsets between adjacent panels.",
        "credit": "Project documentation / PKD Engineering Consultants",
        "fit": "contain"
      },
      {
        "id": "church-panel-deviations",
        "alt": "Comparison of marble panel proportions and colored warpage distributions on the church envelope",
        "caption": "Panel-proportion alternatives compared through warpage distributions. Colored panels identify the deviation bands used in the study.",
        "credit": "Project documentation / PKD Engineering Consultants",
        "fit": "contain"
      }
    ],
    "sections": [
      {
        "title": "Working within established interfaces",
        "text": "A simpler conical geometry would have been easier to rationalize, but changing the envelope in that way would not have satisfied the established interfaces. The study therefore retained double-curved surfaces and examined how flat cladding could be coordinated with them. My responsibilities included geometry optimization, cost-reduction studies and development of the marble facade system, within PKD's facade and structural consultancy for Chyi-Yuh Construction.",
        "media": []
      },
      {
        "title": "Planarization and surface deviation",
        "text": "A twisted portion of the envelope cannot be represented by a single flat marble panel without changing the local surface. Planarization introduces a fish-scale effect: offsets between adjacent panels that project outward or recede inward depending on the curvature. The geometry study made those differences visible before the curtain-wall system was fixed, so the panel arrangement could be assessed together with the architectural surface.",
        "media": [
          "church-planarization"
        ]
      },
      {
        "title": "Comparing panel proportions",
        "text": "Horizontal and vertical division ratios were adjusted to compare the warpage of different segmentation schemes. Deviation distributions, expressed in millimetres in the drawings, allowed the alternatives to be reviewed with the architect. Panel proportion was therefore treated as a geometric decision with consequences for the apparent continuity of the marble surface, rather than only as a subdivision of a finished envelope.",
        "media": [
          "church-detail",
          "church-panel-deviations"
        ]
      },
      {
        "title": "Support-system development and scope",
        "text": "The facade team also studied support arrangements and structural behavior for the flat marble cladding. Panel subdivision and system details were developed in relation to the supporting framework. I worked on geometry and facade-system development with BIM manager Li-Ting Lin; the panel alternatives were reviewed during this design-development phase.",
        "media": [
          "church-construction"
        ]
      }
    ],
    "credits": [
      "Facade and structural consultancy: PKD Engineering Consultants. Client: Chyi-Yuh Construction. Employer: Peter Chen.",
      "Collaboration: Li-Ting Lin (BIM manager). Geometry optimization, cost-reduction studies and marble facade-system development: Chia-Hsuan Chao.",
      "Models and drawings: the owner's project portfolio / PKD project documentation. Construction photography: Li Wei Mechanical Engineering Co., Ltd."
    ]
  },
  {
    "slug": "stare-at-the-silence",
    "title": "Stare at the Silence",
    "subtitle": "Iterative mesh subdivision with Mola",
    "category": "Generative Studies",
    "year": "2023",
    "context": "ETH MAS DFAB / Mesh Subdivision",
    "location": "Zürich, Switzerland",
    "role": "Algorithmic geometry study & visualization",
    "summary": "A MAS DFAB geometry study develops a spherical mesh into a detailed cellular surface through iterative subdivision.",
    "premise": "Stare at the Silence was developed in the 2023 mesh-subdivision teaching context of ETH MAS DFAB. Using the Mola library and the foundational mesh work of Prof. Benjamin Dillenburger, the study examines how successive subdivision changes the relationship between a global form and its local geometric detail.",
    "tags": [
      "Mola",
      "Mesh subdivision",
      "Algorithmic geometry"
    ],
    "cover": {
      "id": "mesh-sphere",
      "alt": "Suspended spherical mesh with intricate subdivided openings",
      "caption": "Global form and local subdivision develop together.",
      "credit": "Chia-Hsuan Chao / project portfolio"
    },
    "gallery": [
      {
        "id": "mesh-detail",
        "alt": "Close view of patterned mesh cells and their fine geometric details",
        "caption": "The subdivision rule becomes visible at a smaller scale.",
        "credit": "Chia-Hsuan Chao / project portfolio"
      }
    ],
    "sections": [
      {
        "title": "Subdivision as a geometric operation",
        "text": "The mesh is divided into progressively smaller components through iterative algorithmic operations. The resulting openings and radii form a cellular surface that can be examined at the scale of the overall sphere and at the scale of an individual cell.",
        "media": [
          "mesh-detail"
        ]
      },
      {
        "title": "Study outcome",
        "text": "I developed the subdivision-based geometry and its visual composition in the MAS DFAB course. The final result is a digital study with visualizations of the complete sphere and its cell-level detail.",
        "media": []
      }
    ],
    "credits": [
      "ETH MAS DFAB, Term 1, 2023. Tutors: Ananya Kango, Simon Griffioen and Petrus Aejmelaeus-Lindström.",
      "Geometry and visualization study: Chia-Hsuan Chao. Teaching and tool references: Prof. Benjamin Dillenburger's mesh-subdivision work and the Mola library."
    ]
  },
  {
    "slug": "planet-garden",
    "title": "Planet of Colorful Garden",
    "subtitle": "Procedural elements and controlled random variation",
    "category": "Generative Studies",
    "year": "2023",
    "context": "ETH MAS DFAB / Generative Art",
    "location": "Zürich, Switzerland",
    "role": "Generative geometry, procedural elements & visual composition",
    "summary": "Rhino.Geometry and GHPython generate garden compositions by placing procedural elements on 3D geometry and varying their positions and colors.",
    "premise": "Inspired by Harold Cohen's artwork, Planet of Colorful Garden was developed as a generative-art study in ETH MAS DFAB. The algorithm combines a defined vocabulary of elements with sampled locations on a host surface or mesh, then applies random transformations to produce variations in the final composition.",
    "tags": [
      "GHPython",
      "Rhino.Geometry",
      "Randomness",
      "Generative art"
    ],
    "cover": {
      "id": "planet-garden",
      "alt": "Colorful garden-like spherical composition with branches and foliage",
      "caption": "Procedural elements populate a three-dimensional garden.",
      "credit": "Chia-Hsuan Chao / project portfolio"
    },
    "gallery": [
      {
        "id": "planet-variations",
        "alt": "A grid of garden worlds in different colors and configurations",
        "caption": "The same set of rules produces a family of variations.",
        "credit": "Chia-Hsuan Chao / project portfolio",
        "fit": "contain"
      },
      {
        "id": "planet-generation-functions",
        "alt": "Function diagram listing procedural element types, surface sampling, random transformations and value processing",
        "caption": "Element types, sampling locations, random transforms and value processing in the generative workflow.",
        "credit": "Chia-Hsuan Chao / project portfolio",
        "fit": "contain"
      }
    ],
    "sections": [
      {
        "title": "Generating a vocabulary of elements",
        "text": "Separate procedures generate trees, branches, spiral plants, mushrooms, large leaves, mesh balls, stones and mist-like elements. These are represented using lines and curves, meshes and NURBS surfaces. Sampling functions locate points on the host surface or mesh, providing positions for the elements within the three-dimensional composition.",
        "media": [
          "planet-generation-functions"
        ]
      },
      {
        "title": "Applying variation",
        "text": "The workflow combines the generated elements with small random movements in the plane or in three dimensions, perturbation, color jitter and value remapping. The parameters alter the arrangement and color of the elements while retaining the structure of the underlying procedures. A set of generated variations shows how the same vocabulary produces different garden-like compositions.",
        "media": [
          "planet-variations"
        ]
      },
      {
        "title": "Visual result",
        "text": "The project concludes with a composed poster and a series of algorithmic outputs. My work covers the procedural element generation, placement and visual composition.",
        "media": []
      }
    ],
    "credits": [
      "ETH MAS DFAB, Term 1, 2023. Tutors: Ananya Kango, Simon Griffioen and Petrus Aejmelaeus-Lindström.",
      "Generative geometry and visual composition: Chia-Hsuan Chao. Artistic reference: Harold Cohen. Tools: Rhino.Geometry and GHPython."
    ]
  }
]

export const lab: Project[] = [
  {
    "slug": "enter-the-void",
    "title": "Enter the Void",
    "subtitle": "Gyroid-derived geometry for a printed lamp",
    "category": "Generative Studies",
    "year": "2018",
    "context": "NCKU × CHIMEI / MODEX",
    "location": "Taiwan",
    "role": "Design-to-fabrication study within an industry collaboration",
    "summary": "An NCKU and CHIMEI / MODEX industry collaboration develops a printed lamp from gyroid geometry while considering fabrication and disassembly.",
    "premise": "The collaboration called for an object that demonstrated the geometric possibilities of 3D printing. Enter the Void develops a lamp from a gyroid, morphing the mathematical surface onto a hyperbolic paraboloid to produce the curved, open geometry of the object.",
    "tags": [
      "Gyroid",
      "3D printing",
      "Lighting"
    ],
    "cover": {
      "id": "void-lamp",
      "alt": "Reflective gyroid-inspired printed lamp with curved openings",
      "caption": "The lamp makes the geometry visible through openings and reflected light.",
      "credit": "Chia-Hsuan Chao / project portfolio"
    },
    "gallery": [
      {
        "id": "void-detail",
        "alt": "Close-up of the curved openings in the printed lamp",
        "caption": "Local curvature changes the way light passes through the object.",
        "credit": "Chia-Hsuan Chao / project portfolio"
      }
    ],
    "sections": [
      {
        "title": "Geometry and product assembly",
        "text": "The gyroid-derived surface forms the curved, open geometry of the printed lamp. Fabrication requirements and disassembly were considered during its design. My contribution was the design-to-fabrication development within the NCKU and CHIMEI / MODEX collaboration.",
        "media": [
          "void-detail"
        ]
      }
    ],
    "credits": [
      "NCKU × CHIMEI / MODEX industry collaboration, Taiwan, 2018.",
      "Design-to-fabrication work: Chia-Hsuan Chao. Images: the owner's project portfolio."
    ]
  },
  {
    "slug": "puff-waffle",
    "title": "Puff Waffle",
    "subtitle": "Differential growth and inflation on a spherical tiling",
    "category": "Generative Studies",
    "year": "2021",
    "context": "Independent study",
    "location": "Taiwan",
    "role": "Individual geometry & simulation study",
    "summary": "An independent geometry study uses constrained differential-growth curves and panel inflation to form a soft, folded spherical surface.",
    "premise": "Puff Waffle takes Andrew Kudless's P_Wall as a reference for representing the appearance of compressed liquid. The study translates that visual question into a sequence of hexagonal tiling, differential growth and inflation.",
    "tags": [
      "Differential growth",
      "Inflation",
      "Geometry"
    ],
    "cover": {
      "id": "puff-waffle",
      "alt": "Inflated spherical geometry with soft folded hexagonal panels",
      "caption": "Growth constraints and inflation shape the surface.",
      "credit": "Chia-Hsuan Chao / project portfolio"
    },
    "gallery": [],
    "sections": [
      {
        "title": "Panel and inflation sequence",
        "text": "Hexagonal panels are arranged on a sphere. A differential-growth curve is generated within each panel and used as a constraining path. Inflating the individual panels produces the rounded volumes and folds of the final digital composition. The geometry study and its visualizations were developed as individual work in 2021.",
        "media": []
      }
    ],
    "credits": [
      "Individual geometry study and visualization: Chia-Hsuan Chao, Taiwan, 2021.",
      "Reference: Andrew Kudless, P_Wall. Images: the owner's project portfolio."
    ]
  },
  {
    "slug": "eggshell",
    "title": "EggShell",
    "subtitle": "Agent-generated toolpaths for thin printed shells",
    "category": "Fabrication & Materials",
    "year": "2020",
    "context": "Independent fabrication study",
    "location": "Taiwan",
    "role": "Individual geometry, G-code generation & printing",
    "summary": "An independent fabrication study converts recorded agent movement into continuous G-code paths for thin, textured printed objects.",
    "premise": "EggShell investigates thin 3D-printed objects through the design of their toolpaths. Agents are initially arranged at the bottom of the geometry and constrained to its surface. Movement forces drive the agents, and their recorded trajectories establish the pattern used for printing.",
    "tags": [
      "G-code",
      "Continuous paths",
      "3D printing"
    ],
    "cover": {
      "id": "eggshell",
      "alt": "Three thin white printed vessels with textured surfaces",
      "caption": "A family of shells explores path-driven surface texture.",
      "credit": "Chia-Hsuan Chao / project portfolio"
    },
    "gallery": [
      {
        "id": "eggshell-detail",
        "alt": "Close-up of light shining through a ridged thin printed shell",
        "caption": "The toolpath is visible in the thin material.",
        "credit": "Chia-Hsuan Chao / project portfolio"
      }
    ],
    "sections": [
      {
        "title": "From agent traces to G-code",
        "text": "The printing path is developed as a continuous curve to avoid a repeated start-and-stop seam. G-code is generated directly in Grasshopper, where movement speed and extrusion quantity can be controlled along the path. The printed shells have surface textures generated by these custom paths. I developed the geometry, toolpath generation and fabrication as individual work in 2020.",
        "media": [
          "eggshell-detail"
        ]
      }
    ],
    "credits": [
      "Individual geometry, G-code generation and fabrication: Chia-Hsuan Chao, Taiwan, 2020.",
      "Images: the owner's project portfolio."
    ]
  },
  {
    "slug": "f5",
    "title": "F5",
    "subtitle": "Fashioning Fabricators for Flexible Forms",
    "category": "XR & Interaction",
    "year": "2019",
    "context": "DigitalFUTURES / ICD, University of Stuttgart & Tongji University",
    "location": "Shanghai, China",
    "role": "Workshop participant · assembly, choreography & installation",
    "summary": "A DigitalFUTURES workshop investigates collective robotic construction through bespoke mobile machines and their spatial choreography.",
    "premise": "F5 was led by ICD, University of Stuttgart, at Tongji University during DigitalFUTURES 2019 in Shanghai. The week-long workshop examined how a group of mobile machines could reconfigure a shared environment and relate to human occupation, extending robotic construction into the use of architectural space.",
    "tags": [
      "Mobile robotics",
      "Choreography",
      "Workshop"
    ],
    "cover": {
      "id": "f5-robots",
      "alt": "A group of bespoke wheeled robotic units arranged on the floor",
      "caption": "Custom mobile machines developed within the collective workshop.",
      "credit": "Chia-Hsuan Chao / project portfolio"
    },
    "gallery": [
      {
        "id": "f5-space",
        "alt": "Fabric suspended in a spatial installation",
        "caption": "Machine choreography is explored through a physical installation.",
        "credit": "Chia-Hsuan Chao / project portfolio"
      }
    ],
    "sections": [
      {
        "title": "Assembly, choreography and installation",
        "text": "Participants worked on the assembly, choreography and installation of a bespoke multirobot system. The relation between machine movement, physical space and human interaction was the central subject. I participated in these collective workshop activities.",
        "media": []
      },
      {
        "title": "Workshop exhibition",
        "text": "The workshop concluded with an exhibition on July 6, 2019. The resulting installation used the mobile machines to reconfigure a shared spatial environment.",
        "media": [
          "f5-space"
        ]
      }
    ],
    "credits": [
      "ICD, University of Stuttgart: Prof. Achim Menges, Maria Yablonina and Samuel Leder. Organized and supported by CAUP Tongji University and FabUnion, Shanghai / Prof. Philip F. Yuan.",
      "Collective work by the workshop participants. Chia-Hsuan Chao is listed as Josh Chao in the official participant credits. Full team credits are available on the ICD project page."
    ],
    "links": [
      {
        "label": "ICD workshop record and full credits",
        "url": "https://www.icd.uni-stuttgart.de/teaching/workshops/digital-futures-f5-fashioning-fabricators-for-flexible-forms/"
      }
    ]
  }
]

export function findProject(slug: string) { return [...projects, ...lab].find(project => project.slug === slug) }
export function filterProjects(items: Project[], category: string, query: string) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  return items.filter(p => (category === 'All' || p.category === category) && words.every(word => `${p.title} ${p.summary} ${p.tags.join(' ')} ${p.role}`.toLowerCase().includes(word)))
}

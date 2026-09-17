# CHOICE[board][n][level] = (question, [option0, option1, option2], correct index, hint, ok text)
L=['k5','g8','hs','col','max']
def same(q,opts,i,hint,ok): return {l:(q,opts,i,hint,ok) for l in L}
CHOICE={'einstein':{},'infinity':{},'history':{}}
E=CHOICE['einstein']
E[1]={'k5':("Which pull can push things away as well as pull them?",["gravity","magnetism","both"],1,"Think about two magnets turned the wrong way.","Right. Magnets push and pull. Gravity only pulls."),
 'g8':("Both pulls weaken with distance in the same way. What is that rule called?",["inverse-square law","the doubling rule","Ohm's law"],0,"Twice as far, one quarter the pull.","Right. Inverse-square, for both."),
 'hs':("Between two protons, the electric force compared with gravity is about",["10 times stronger","10³⁶ times stronger","the same"],1,"It is enormous.","Right. About 10³⁶."),
 'col':("In Einstein's 'marble and wood' remark, the wood is",["the geometry on the left","the matter and fields on the right","the equals sign"],1,"He wanted to turn wood into marble.","Right. The stress-energy side, put in by hand."),
 'max':("Weyl's 1918 scale-gauge idea failed because",["it predicted history-dependent atomic spectra","it had too many components","it was not covariant"],0,"The second clock effect.","Right. Spectral lines would depend on an atom's history.")}
E[2]={'k5':("In Einstein's picture, what makes a marble curve toward the Sun?",["a rope","the dent in the sheet","the wind"],1,"Look at the shape of the grid.","Right. The dent. That curving is gravity."),
 'g8':("Which prediction did Newton's gravity get wrong and Einstein's get right?",["the tides","Mercury's orbit drift","the length of a year"],1,"A tiny extra turn every century.","Right. The 43 arcseconds per century."),
 'hs':("The equivalence principle says a freely falling person",["feels gravity strongly","cannot tell gravity from floating","weighs twice as much"],1,"Think of an elevator with the cable cut.","Right. Falling feels like floating, so gravity is not a force on you."),
 'col':("Most of ordinary falling comes from curvature of",["space","time (g₀₀)","neither"],1,"The rubber sheet cannot draw it.","Right. The time component does the work."),
 'max':("Pure general relativity first diverges perturbatively at",["one loop","two loops","it never does"],1,"Goroff and Sagnotti, 1986.","Right. Two loops, with a Riemann-cubed counterterm.")}
E[3]={'k5':("What does a compass needle line up with?",["the invisible hair (the field)","the Sun","the nearest wall"],0,"The hair is the field.","Right. It points along the field."),
 'g8':("Where do electric field lines start and end?",["start on −, end on +","start on +, end on −","they never end"],1,"Positive to negative.","Right. From + to −."),
 'hs':("Equipotential lines cross field lines at",["any angle","right angles","they never cross"],1,"No work is done moving along an equipotential.","Right. Always perpendicular."),
 'col':("The electromagnetic field tensor F has how many independent components?",["4","6","10"],1,"Three electric plus three magnetic.","Right. Six."),
 'max':("Electromagnetism is a connection on",["the tangent bundle","a U(1) bundle over spacetime","no bundle at all"],1,"Its curvature lives in an internal circle.","Right. A U(1) principal bundle.")}
E[4]={'k5':("What was Einstein's wish?",["that electricity was also a shape","that gravity would go away","that magnets were bigger"],0,"One rule for shapes.","Right. Everything as geometry."),
 'g8':("Describing the shape of spacetime at a point takes how many numbers?",["6","10","16"],1,"And the field takes six more.","Right. Ten, plus six for the field, makes sixteen."),
 'hs':("A general 4×4 matrix has 16 entries. The symmetric part has how many?",["6","10","16"],1,"Diagonal plus one triangle.","Right. Ten symmetric, six antisymmetric."),
 'col':("Which condition did Einstein's attempts most often fail?",["reproducing Newton","deriving the Lorentz force on charges","being covariant"],1,"Charges had to feel the right force.","Right. The equations of motion for charges."),
 'max':("Coleman–Mandula forbids mixing spacetime and internal symmetries except through",["gauge symmetry","supersymmetry","conformal symmetry"],1,"The graded loophole.","Right. Haag–Łopuszański–Sohnius.")}
E[5]={'k5':("What can the ant do on the hose that you cannot see from far away?",["walk around it","fly","stop"],0,"The hose is a tube.","Right. It can go around."),
 'g8':("In Klein's idea, electric charge is",["momentum around the tiny loop","the color of the loop","the weight of the ant"],0,"Think of the ant going around.","Right. Momentum around the fifth direction."),
 'hs':("A 5-dimensional metric has 15 components. They split as",["10 + 4 + 1","5 + 5 + 5","15 + 0 + 0"],0,"Gravity, a vector, a scalar.","Right. Metric, potential, dilaton."),
 'col':("Setting the dilaton constant is inconsistent unless",["F² = 0","R = 0","the radius is zero"],0,"Thiry and Jordan noticed it.","Right. The scalar cannot be truncated."),
 'max':("Witten showed the minimal internal dimension for the Standard Model gauge group is",["4","7","11"],1,"Giving eleven total.","Right. Seven internal dimensions.")}
E[6]={'k5':("In twisted space, what do the marbles do?",["fall straight in","swirl around","sit still"],1,"Twist, not dent.","Right. They swirl."),
 'g8':("How many numbers do four arrows at each point give?",["4","10","16"],2,"Four arrows, four numbers each.","Right. Sixteen: ten plus six spare."),
 'hs':("In teleparallel geometry the curvature is",["zero, with torsion nonzero","nonzero, with torsion zero","both zero"],0,"Distant parallelism.","Right. Flat, but twisted."),
 'col':("In ordinary GR the six extra tetrad components are",["electromagnetism","pure local Lorentz gauge","dark matter"],1,"They change nothing physical.","Right. Gauge, so no room for the field."),
 'max':("Torsion legitimately appears in",["Einstein–Cartan theory and supergravity","Maxwell's equations","Newtonian gravity"],0,"Sourced by spin.","Right. It has a settled place there.")}
E[7]={'k5':("Which part of the lopsided ruler did Einstein call gravity?",["the part that is the same both ways","the part that changes","neither"],0,"Same both ways.","Right. The symmetric part."),
 'g8':("Dropping the symmetry turns 10 numbers into",["6","12","16"],2,"A full 4×4 table.","Right. Sixteen."),
 'hs':("In 1953 Callaway showed that charges in this theory",["repel too strongly","feel no electromagnetic force","turn into gravity"],1,"The most damaging test.","Right. No Lorentz force."),
 'col':("The antisymmetric part of the metric cannot be a photon because it lacks",["a gauge invariance","a mass","a sign"],0,"a → a + dλ is missing.","Right. No gauge symmetry, no massless spin-1."),
 'max':("A g + B combination reappears in",["string theory's NS–NS sector","Newtonian mechanics","thermodynamics"],0,"The B-field.","Right. Buscher rules and Seiberg–Witten.")}
E[8]={'k5':("How many pulls do scientists know about today?",["two","four","ten"],1,"Einstein knew only two.","Right. Four."),
 'g8':("Which force will not join the Standard Model?",["gravity","the weak force","electromagnetism"],0,"The last one standing.","Right. Gravity."),
 'hs':("The three Standard Model forces nearly meet in strength near",["10⁴ GeV","10¹⁶ GeV","10⁻³ GeV"],1,"Far beyond any accelerator.","Right. Around 10¹⁶ GeV."),
 'col':("Electroweak theory is not a full unification because",["it keeps two independent couplings","it has no Higgs","it forbids photons"],0,"The Weinberg angle is free.","Right. Two couplings, g and g′."),
 'max':("The Weinberg–Witten theorem blocks",["an emergent graviton in the same spacetime","supersymmetry","gauge bosons"],0,"Holography evades it by changing dimension.","Right.")}
E[9]={'k5':("Why can't scientists look at very tiny things to solve the puzzle?",["they are too small to see with anything","they are too bright","they are too far"],0,"10⁻³⁵ metres.","Right. No instrument reaches that scale."),
 'g8':("What happens when you write gravity and quantum rules in one equation today?",["nothing","the answers come out infinite","it works"],1,"That is the honest 'not yet'.","Right. Infinite answers."),
 'hs':("The Planck energy is roughly",["10⁴ GeV","10¹⁹ GeV","10² GeV"],1,"Fifteen orders beyond the LHC.","Right."),
 'col':("Black hole entropy scales with the horizon's",["volume","area","mass squared"],1,"Bekenstein–Hawking.","Right. S = A/4."),
 'max':("Holography gives a non-perturbative definition of quantum gravity in",["de Sitter space","asymptotically AdS space","flat space only"],1,"Not yet the universe we live in.","Right.")}
E[10]={'k5':("Which rule kept the marbles circling?",["twice as far, a quarter the pull","twice as far, half the pull","no rule"],0,"Our universe's rule.","Right. The inverse-square rule."),
 'g8':("What happened with the cube rule?",["orbits became stable","marbles spiralled in or flew away","nothing changed"],1,"A nudge is fatal.","Right. Unstable."),
 'hs':("Bertrand's theorem says closed orbits for every start need",["n = 2 or the spring rule","any n","n = 3"],0,"Only two rules.","Right."),
 'col':("Gauss's law in d dimensions gives a force law with n =",["d","d − 1","d + 1"],1,"Spheres of area r^(d−1).","Right. Inverse-square means three dimensions."),
 'max':("Tabletop tests confirm inverse-square down to about",["1 metre","50 micrometres","1 nanometre"],1,"Eöt-Wash.","Right.")}
I=CHOICE['infinity']
I[1]={'k5':("How can you tell two piles are the same size without counting?",["weigh them","pair them up","guess"],1,"One apple, one cup.","Right. Pairing."),
 'g8':("A pairing where everything has exactly one partner is called",["one-to-one","a guess","a count"],0,"One to one.","Right."),
 'hs':("|A| = |B| means",["A and B look alike","a bijection A → B exists","A is a subset of B"],1,"One-to-one and onto.","Right."),
 'col':("The Cantor–Schröder–Bernstein theorem says injections both ways give",["nothing","a bijection","a contradiction"],1,"So ≤ is antisymmetric.","Right."),
 'max':("Comparability of all cardinals is equivalent to",["the axiom of choice","the continuum hypothesis","Peano arithmetic"],0,"Hartogs 1915.","Right.")}
I[2]={'k5':("The hotel is full and one guest arrives. What does everyone do?",["leave","move up one room","share"],1,"Room 1 becomes free.","Right."),
 'g8':("A set is infinite exactly when it can be paired with",["nothing","a part of itself","a bigger set"],1,"The even rooms.","Right."),
 'hs':("The size of the counting numbers is written",["ℵ₀","∞","10¹⁰⁰"],0,"Aleph-null.","Right."),
 'col':("The infinitely-many-buses trick needs",["countable choice","no extra assumptions","the continuum hypothesis"],0,"Choosing an enumeration for each bus.","Right."),
 'max':("In ZF without choice, ℝ can be",["finite","a countable union of countable sets","well-ordered always"],1,"Feferman–Levy.","Right.")}
I[3]={'k5':("How many fractions are there compared with whole numbers?",["more","exactly as many","fewer"],1,"The zigzag numbers them all.","Right. The same."),
 'g8':("A set that can be paired with 1, 2, 3, ... is called",["countable","dense","huge"],0,"Every element gets a number.","Right."),
 'hs':("Which is countable?",["the rationals","the reals","both"],0,"Zigzag versus diagonal.","Right. Only ℚ."),
 'col':("Cantor's first proof that transcendentals exist used",["counting the algebraic numbers","the diagonal argument","calculus"],0,"1874.","Right."),
 'max':("Cantor's 1874 uncountability proof used",["nested intervals","diagonalization","forcing"],0,"The diagonal came in 1891.","Right.")}
I[4]={'k5':("The new number Cantor makes is",["on the list somewhere","different from every number on the list","the biggest number"],1,"Change the diagonal.","Right."),
 'g8':("Why can't you fix the list by adding the new number?",["you can","the diagonal grows with it and misses again","the list is too long"],1,"Flip again.","Right."),
 'hs':("The diagonal argument proves {0,1}^ℕ is",["countable","uncountable","empty"],1,"bₙ = 1 − aₙₙ.","Right."),
 'col':("Cantor's theorem: for every set X there is no surjection from X onto",["X","𝒫(X)","ℕ"],1,"The power set.","Right."),
 'max':("Lawvere's fixed-point theorem unifies Cantor with",["Gödel, Tarski and Turing","Euclid","Newton"],0,"One theorem, many categories.","Right.")}
I[5]={'k5':("Is there a biggest infinity?",["yes","no, they climb a ladder forever","only two"],1,"Take all the groups you can make.","Right."),
 'g8':("The continuum hypothesis turned out to be",["true","false","undecidable from the usual rules"],2,"Gödel and Cohen.","Right."),
 'hs':("Gödel (1940) showed CH",["is true","cannot be disproved in ZFC","is false"],1,"The constructible universe.","Right."),
 'col':("Cohen's method for adding new reals is called",["forcing","diagonalization","induction"],0,"1963.","Right."),
 'max':("Forcing axioms such as PFA imply 2^ℵ₀ equals",["ℵ₁","ℵ₂","ℵ₀"],1,"Not CH.","Right.")}
H=CHOICE['history']
H[1]={'k5':("Each hand copy of a story has",["no mistakes","a few new mistakes plus the old ones","fewer mistakes"],1,"Mistakes pile up.","Right."),
 'g8':("A mistake shared by two copies most likely came from",["chance","their common parent","the reader"],1,"Shared errors are inherited.","Right."),
 'hs':("Errors are informative for reconstruction because they are",["random","inherited","rare"],1,"Copies carry their parent's errors.","Right."),
 'col':("A scribe using two exemplars at once causes",["contamination","haplography","nothing"],0,"It breaks the tree model.","Right."),
 'max':("Manuscript traditions are now often analysed with methods from",["phylogenetics","astronomy","cryptography"],0,"Witnesses as taxa.","Right.")}
H[2]={'k5':("Which is the best clue to which copies are related?",["their size","the mistakes they share","their colour"],1,"Shared mistakes.","Right."),
 'g8':("When choosing the original reading you count",["manuscripts","branches","pages"],1,"Three copies of one parent are one vote.","Right."),
 'hs':("The harder reading is usually",["a mistake","original","later"],1,"Scribes simplify.","Right. Lectio difficilior."),
 'col':("Bédier objected that most published stemmata are",["circular","bifid","too tall"],1,"Two branches, suspiciously often.","Right."),
 'max':("The archetype is",["the author's autograph","the latest common ancestor of the survivors","the oldest manuscript"],1,"And it may itself be corrupt.","Right.")}
H[3]={'k5':("What helped Champollion read hieroglyphs?",["a stone with the same text in Greek","a dictionary","a map"],0,"The Rosetta Stone.","Right."),
 'g8':("Champollion's way in was",["kings' names in ovals","numbers","colours"],0,"Ptolemy and Cleopatra.","Right."),
 'hs':("Linear B was deciphered without",["a bilingual","any text","a language"],0,"Kober's grid, Ventris's leap.","Right."),
 'col':("Maya decipherment required abandoning the assumption that the script was",["an alphabet","a language","old"],0,"Logosyllabic.","Right."),
 'max':("The Indus script resists decipherment mainly because inscriptions are",["too long","too short","in Greek"],1,"About five signs each.","Right.")}
H[4]={'k5':("After 5,730 years, how much carbon-14 is left?",["all","half","none"],1,"One half-life.","Right."),
 'g8':("Radiocarbon dating works back to about",["500 years","50,000 years","5 million years"],1,"Then too little is left.","Right."),
 'hs':("Raw radiocarbon years must be calibrated because",["clocks drift","carbon-14 in the air has varied","trees lie"],1,"Solar activity and the magnetic field.","Right."),
 'col':("A plateau in the calibration curve makes dates",["sharper","ambiguous","impossible"],1,"The Hallstatt plateau.","Right."),
 'max':("Miyake events give",["single-year anchors","century-scale errors","no information"],0,"774/775 AD.","Right.")}
H[5]={'k5':("What is the scribes' trick that also saves computer files?",["make copies","print them","wait"],0,"Copies in different places.","Right."),
 'g8':("The two ways a digital file dies are",["bit rot and format death","fire and water","viruses and age"],0,"Flips, and nothing can read it.","Right."),
 'hs':("A checksum can",["detect corruption","correct corruption","prevent it"],0,"Codes correct; checksums detect.","Right."),
 'col':("The 1986 BBC Domesday Project needed rescue by",["emulation","printing","carbon dating"],0,"Within 16 years.","Right."),
 'max':("The decisive filter on today's digital record is",["selection: what gets crawled and funded","bit rot","printing cost"],0,"Same as papyrus, faster.","Right.")}
H[6]={'k5':("Whose writing from long ago mostly survived?",["kings and priests","children","shopkeepers"],0,"What got copied.","Right."),
 'g8':("The historical record is a sample of",["the past","what got copied and kept dry","everything"],1,"Survivorship bias.","Right."),
 'hs':("Of about 800 known ancient Greek authors, substantial texts survive from fewer than",["150","500","790"],0,"Most is lost.","Right."),
 'col':("Unseen-species models estimate the surviving share of medieval works at about",["3%","32%","90%"],1,"Kestemont 2022.","Right."),
 'max':("Digital archives invert the old bias: the record is",["vast but shallow","small and deep","complete"],0,"Crawling policy decides.","Right.")}

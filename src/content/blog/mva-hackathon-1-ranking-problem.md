---
title: "A genome as a ranking problem"
date: 2026-09-10
description: "Part one of a series on the 2026 MVA hackathon: what the disease is, the biology you need to read a VCF, and what the task asks for."
author: "Pablo Olivares"
tags: ["mva-hackathon", "genomics", "rare-disease", "variant-prioritization", "ranking"]
categories: ["MVA Hackathon"]
draft: false
---
I don't work in biology. I build AI and ML platforms: feature pipelines, training and evaluation loops, and the unglamorous machinery between a notebook and something running in production. My fluency is in mathematics, data, and abstractions, and in asking of every result: what would make this number wrong?

In August 2026 Sage Bionetworks and the MVA Society opened a hackathon built on the real whole-genome sequence and clinical history of one child living with Mosaic Variegated Aneuploidy (MVA). The family consented to sharing it with the research community. There is no established treatment for MVA; care today means managing symptoms and watching for cancer. The challenge asks participants to identify the genetic changes responsible for the condition and, in a second track, to propose approved drugs worth investigating against those changes.

I entered because of one half of that task. I will never be the person who reads mechanism off a karyotype. But I do know how to take five million unlabeled candidates, decide what a good ordering of them looks like, and build the pipeline that produces one. That is the job, and it's the one I have.

This post is the first in a series that runs from the biology I half-remember from school to whatever I submit on 24 October, and it is written for data scientists and ML engineers with no bioinformatics background. The most interesting thing I've found so far is this: the problem is a ranking problem.

Four constraints before anything else:

1. **I only write about what the organisers already published.** No phenotype details, no variants I find, no genotype-level output in a public post. When the leaderboard freezes in October I'll be more specific.
2. **The data is controlled.** It sits under IRB #20252010 and a data-use agreement. No re-identification attempts, not even as an idle thought experiment.
3. **Outputs are CC BY 4.0**, and the hackathon is explicitly not medical advice or diagnosis. Neither is this post.
4. **My repository stays private until the hackathon closes**, as required; it's also why there are no code links in this post.

### The biology you need

Before the task makes sense you need the biology that produces those five million rows: not to do it, but to know what each row means. My baseline was school biology (central dogma, mitosis, a karyotype diagram), long decayed into recognising the words. Here is the part I needed, in the order the problem needed it.

A genome is roughly 3.1 billion positions, each one of A, C, G, or T. Sequencers do not read a genome in one pass; they read 150-base fragments called **reads**, and the full picture is assembled computationally. You carry two copies of every chromosome, one per parent, so a position is a pair of characters, not a single letter.

<figure class="ml-fig" aria-label="DNA double helix with base pairs">
  <svg viewBox="0 72 560 228" role="img" aria-labelledby="bp-t bp-d">
    <title id="bp-t">A DNA double helix, two strands joined by base pairs</title>
    <desc id="bp-d">Two strands wind around each other twice and a half. Five base pairs bridge them, each labelled: adenine with thymine, guanine with cytosine. The rungs are longest where the strands are furthest apart.</desc>
    <polyline points="70,196.8 72,193.9 74,190.7 76,187.3 78,183.8 80,180.1 82,176.2 84,172.3 86,168.2 88,164.1 90,160.0 92,155.9 94,151.8 96,147.7 98,143.8 100,139.9 102,136.2 104,132.7 106,129.3 108,126.1 110,123.2 112,120.5 114,118.1 116,116.0 118,114.2 120,112.7 122,111.5 124,110.7 126,110.2 128,110.0 130,110.2 132,110.7 134,111.5 136,112.7 138,114.2 140,116.0 142,118.1 144,120.5 146,123.2 148,126.1 150,129.3 152,132.7 154,136.2 156,139.9 158,143.8 160,147.7 162,151.8 164,155.9 166,160.0 168,164.1 170,168.2 172,172.3 174,176.2 176,180.1 178,183.8 180,187.3 182,190.7 184,193.9 186,196.8 188,199.5 190,201.9 192,204.0 194,205.8 196,207.3 198,208.5 200,209.3 202,209.8 204,210.0 206,209.8 208,209.3 210,208.5 212,207.3 214,205.8 216,204.0 218,201.9 220,199.5 222,196.8 224,193.9 226,190.7 228,187.3 230,183.8 232,180.1 234,176.2 236,172.3 238,168.2 240,164.1 242,160.0 244,155.9 246,151.8 248,147.7 250,143.8 252,139.9 254,136.2 256,132.7 258,129.3 260,126.1 262,123.2 264,120.5 266,118.1 268,116.0 270,114.2 272,112.7 274,111.5 276,110.7 278,110.2 280,110.0 282,110.2 284,110.7 286,111.5 288,112.7 290,114.2 292,116.0 294,118.1 296,120.5 298,123.2 300,126.1 302,129.3 304,132.7 306,136.2 308,139.9 310,143.8 312,147.7 314,151.8 316,155.9 318,160.0 320,164.1 322,168.2 324,172.3 326,176.2 328,180.1 330,183.8 332,187.3 334,190.7 336,193.9 338,196.8 340,199.5 342,201.9 344,204.0 346,205.8 348,207.3 350,208.5 352,209.3 354,209.8 356,210.0 358,209.8 360,209.3 362,208.5 364,207.3 366,205.8 368,204.0 370,201.9 372,199.5 374,196.8 376,193.9 378,190.7 380,187.3 382,183.8 384,180.1 386,176.2 388,172.3 390,168.2 392,164.1 394,160.0 396,155.9 398,151.8 400,147.7 402,143.8 404,139.9 406,136.2 408,132.7 410,129.3 412,126.1 414,123.2 416,120.5 418,118.1 420,116.0 422,114.2 424,112.7 426,111.5 428,110.7 430,110.2 432,110.0 434,110.2 436,110.7 438,111.5 440,112.7 442,114.2 444,116.0 446,118.1 448,120.5 450,123.2 452,126.1 454,129.3 456,132.7 458,136.2 460,139.9 462,143.8 464,147.7 466,151.8 468,155.9 470,160.0 472,164.1 474,168.2 476,172.3 478,176.2 480,180.1 482,183.8 484,187.3 486,190.7 488,193.9 490,196.8" fill="none" stroke="var(--muted)" stroke-width="2" opacity="0.4" />
    <line x1="128" y1="110.0" x2="128" y2="210.0" stroke="var(--muted)" stroke-width="1.5" />
<line x1="204" y1="210.0" x2="204" y2="110.0" stroke="var(--muted)" stroke-width="1.5" />
<line x1="280" y1="110.0" x2="280" y2="210.0" stroke="var(--brand-green)" stroke-width="1.5" />
<line x1="356" y1="210.0" x2="356" y2="110.0" stroke="var(--muted)" stroke-width="1.5" />
<line x1="432" y1="110.0" x2="432" y2="210.0" stroke="var(--muted)" stroke-width="1.5" />
    </g>
    <polyline points="70,123.2 72,126.1 74,129.3 76,132.7 78,136.2 80,139.9 82,143.8 84,147.7 86,151.8 88,155.9 90,160.0 92,164.1 94,168.2 96,172.3 98,176.2 100,180.1 102,183.8 104,187.3 106,190.7 108,193.9 110,196.8 112,199.5 114,201.9 116,204.0 118,205.8 120,207.3 122,208.5 124,209.3 126,209.8 128,210.0 130,209.8 132,209.3 134,208.5 136,207.3 138,205.8 140,204.0 142,201.9 144,199.5 146,196.8 148,193.9 150,190.7 152,187.3 154,183.8 156,180.1 158,176.2 160,172.3 162,168.2 164,164.1 166,160.0 168,155.9 170,151.8 172,147.7 174,143.8 176,139.9 178,136.2 180,132.7 182,129.3 184,126.1 186,123.2 188,120.5 190,118.1 192,116.0 194,114.2 196,112.7 198,111.5 200,110.7 202,110.2 204,110.0 206,110.2 208,110.7 210,111.5 212,112.7 214,114.2 216,116.0 218,118.1 220,120.5 222,123.2 224,126.1 226,129.3 228,132.7 230,136.2 232,139.9 234,143.8 236,147.7 238,151.8 240,155.9 242,160.0 244,164.1 246,168.2 248,172.3 250,176.2 252,180.1 254,183.8 256,187.3 258,190.7 260,193.9 262,196.8 264,199.5 266,201.9 268,204.0 270,205.8 272,207.3 274,208.5 276,209.3 278,209.8 280,210.0 282,209.8 284,209.3 286,208.5 288,207.3 290,205.8 292,204.0 294,201.9 296,199.5 298,196.8 300,193.9 302,190.7 304,187.3 306,183.8 308,180.1 310,176.2 312,172.3 314,168.2 316,164.1 318,160.0 320,155.9 322,151.8 324,147.7 326,143.8 328,139.9 330,136.2 332,132.7 334,129.3 336,126.1 338,123.2 340,120.5 342,118.1 344,116.0 346,114.2 348,112.7 350,111.5 352,110.7 354,110.2 356,110.0 358,110.2 360,110.7 362,111.5 364,112.7 366,114.2 368,116.0 370,118.1 372,120.5 374,123.2 376,126.1 378,129.3 380,132.7 382,136.2 384,139.9 386,143.8 388,147.7 390,151.8 392,155.9 394,160.0 396,164.1 398,168.2 400,172.3 402,176.2 404,180.1 406,183.8 408,187.3 410,190.7 412,193.9 414,196.8 416,199.5 418,201.9 420,204.0 422,205.8 424,207.3 426,208.5 428,209.3 430,209.8 432,210.0 434,209.8 436,209.3 438,208.5 440,207.3 442,205.8 444,204.0 446,201.9 448,199.5 450,196.8 452,193.9 454,190.7 456,187.3 458,183.8 460,180.1 462,176.2 464,172.3 466,168.2 468,164.1 470,160.0 472,155.9 474,151.8 476,147.7 478,143.8 480,139.9 482,136.2 484,132.7 486,129.3 488,126.1 490,123.2" fill="none" stroke="var(--ink)" stroke-width="2" />
    <g>
<text x="128" y="101.0" font-size="12" text-anchor="middle" fill="var(--ink)" stroke="var(--canvas)" stroke-width="4" paint-order="stroke">A</text>
<text x="128" y="227.0" font-size="12" text-anchor="middle" fill="var(--ink)" stroke="var(--canvas)" stroke-width="4" paint-order="stroke">T</text>
<text x="204" y="101.0" font-size="12" text-anchor="middle" fill="var(--ink)" stroke="var(--canvas)" stroke-width="4" paint-order="stroke">T</text>
<text x="204" y="227.0" font-size="12" text-anchor="middle" fill="var(--ink)" stroke="var(--canvas)" stroke-width="4" paint-order="stroke">A</text>
<text x="280" y="101.0" font-size="12" text-anchor="middle" fill="var(--brand-green-deep)" stroke="var(--canvas)" stroke-width="4" paint-order="stroke">G</text>
<text x="280" y="227.0" font-size="12" text-anchor="middle" fill="var(--brand-green-deep)" stroke="var(--canvas)" stroke-width="4" paint-order="stroke">C</text>
<text x="356" y="101.0" font-size="12" text-anchor="middle" fill="var(--ink)" stroke="var(--canvas)" stroke-width="4" paint-order="stroke">C</text>
<text x="356" y="227.0" font-size="12" text-anchor="middle" fill="var(--ink)" stroke="var(--canvas)" stroke-width="4" paint-order="stroke">G</text>
<text x="432" y="101.0" font-size="12" text-anchor="middle" fill="var(--ink)" stroke="var(--canvas)" stroke-width="4" paint-order="stroke">A</text>
<text x="432" y="227.0" font-size="12" text-anchor="middle" fill="var(--ink)" stroke="var(--canvas)" stroke-width="4" paint-order="stroke">T</text>
    </g>
    <text x="280" y="252" font-size="10" fill="var(--muted)" text-anchor="middle">two strands, one string of characters: a position holds two letters</text>
    <text x="280" y="274" font-size="10" fill="var(--ink)" text-anchor="middle">A pairs with T, G pairs with C</text>
  </svg>
  <figcaption><span class="ml-cap-id">Fig. 1 — every position is a pair, not a letter.</span> You carry two copies of every chromosome, so a genome coordinate holds two characters, one per strand. Same letter on both copies is homozygous; different letters is heterozygous: the `0/1` and `1/1` you'll meet in real files.</figcaption>
</figure>

Everything downstream is expressed as coordinates against a **reference genome**: a canonical string that serves as the address space (currently GRCh38). Treat it like a schema version. If your reference version and your annotation version disagree, or one file says `chr1` where another says `1`, joins fail silently. Nothing errors. Your results are just wrong.

Most of the genome is archive; the working parts are **genes**, stretches of DNA that code for something, with regulatory regions around them. A gene is read in two steps. **Transcription** copies the gene from DNA to messenger RNA (mRNA), the same alphabet with T swapped for U. **Translation** then reads the mRNA three bases at a time; each triplet, a **codon**, specifies one of twenty amino acids, and the chain folds into a **protein** that does the work.

<figure class="ml-fig" aria-label="Central dogma: DNA to RNA to protein">
  <svg viewBox="0 0 560 275" role="img" aria-labelledby="cd-t cd-d">
    <title id="cd-t">From a DNA sequence to a protein, three bases at a time</title>
    <desc id="cd-d">Three codons of DNA are transcribed into messenger RNA, thymine becoming uracil, then translated: each three-base codon becomes one amino acid, Met, Lys and Phe. The first codon, ATG, is the start codon and is highlighted green.</desc>
    <text x="40" y="72" font-size="10" letter-spacing="0.06em" fill="var(--muted)">DNA</text>
    <g fill="var(--muted)" fill-opacity="0.05" stroke="var(--hairline)" stroke-width="1">
      <rect x="254" y="52" width="52" height="28" />
      <rect x="364" y="52" width="52" height="28" />
    </g>
    <rect x="144" y="52" width="52" height="28" fill="var(--brand-green)" fill-opacity="0.16" stroke="var(--brand-green)" stroke-width="1" />
    <g font-size="13" fill="var(--ink)" text-anchor="middle">
      <text x="170" y="72">ATG</text>
      <text x="280" y="72">AAG</text>
      <text x="390" y="72">TTT</text>
    </g>
    <text x="170" y="40" font-size="9" fill="var(--muted)" text-anchor="middle">start codon</text>
    <line x1="170" y1="43" x2="170" y2="51" stroke="var(--muted)" stroke-width="1" />
    <text x="280" y="102" font-size="10" fill="var(--muted)" text-anchor="middle">transcription (T becomes U)</text>
    <line x1="280" y1="108" x2="280" y2="126" stroke="var(--muted)" stroke-width="1.2" />
    <path d="M280 128 L276.5 120 H283.5 Z" fill="var(--muted)" />
    <text x="40" y="154" font-size="10" letter-spacing="0.06em" fill="var(--muted)">mRNA</text>
    <g fill="var(--muted)" fill-opacity="0.05" stroke="var(--hairline)" stroke-width="1">
      <rect x="254" y="134" width="52" height="28" />
      <rect x="364" y="134" width="52" height="28" />
    </g>
    <rect x="144" y="134" width="52" height="28" fill="var(--brand-green)" fill-opacity="0.16" stroke="var(--brand-green)" stroke-width="1" />
    <g font-size="13" fill="var(--ink)" text-anchor="middle">
      <text x="170" y="154">AUG</text>
      <text x="280" y="154">AAG</text>
      <text x="390" y="154">UUU</text>
    </g>
    <text x="280" y="184" font-size="10" fill="var(--muted)" text-anchor="middle">translation</text>
    <line x1="280" y1="190" x2="280" y2="208" stroke="var(--muted)" stroke-width="1.2" />
    <path d="M280 210 L276.5 202 H283.5 Z" fill="var(--muted)" />
    <text x="40" y="242" font-size="10" letter-spacing="0.06em" fill="var(--muted)">PROTEIN</text>
    <circle cx="170" cy="238" r="19" fill="var(--brand-green)" fill-opacity="0.16" stroke="var(--brand-green)" stroke-width="1" />
    <circle cx="280" cy="238" r="19" fill="var(--muted)" fill-opacity="0.08" stroke="var(--hairline)" stroke-width="1" />
    <circle cx="390" cy="238" r="19" fill="var(--muted)" fill-opacity="0.08" stroke="var(--hairline)" stroke-width="1" />
    <g font-size="10" fill="var(--ink)" text-anchor="middle">
      <text x="170" y="242">Met</text>
      <text x="280" y="242">Lys</text>
      <text x="390" y="242">Phe</text>
    </g>
  </svg>
  <figcaption><span class="ml-cap-id">Fig. 2 — the central dogma, compressed.</span> A gene is a string; transcription copies it to mRNA, and a ribosome reads it three bases at a time, one amino acid per codon, starting at the start codon, the green column. Three bases, one amino acid: shift the frame by one and everything downstream changes.</figcaption>
</figure>

Two consequences come up constantly. First, context: the same three letters mean different things depending on the gene they sit in, so annotation always joins against a gene model, never against the raw string. Second, the cell cuts **introns** out of the mRNA between transcription and translation and sews the protein-coding **exons** together; changes that break those cut points are their own class of catastrophe.

A **variant** is a difference from the reference, and most are harmless: they sit between genes, change a base without changing the amino acid, or are simply common in healthy populations. The ones medicine cares about do one of a small set of things to a protein:

<figure class="ml-fig" aria-label="Variant classes and their protein consequences">
  <svg viewBox="0 0 560 230" role="img" aria-labelledby="vt-t vt-d">
    <title id="vt-t">Three variant classes: missense, nonsense, frameshift</title>
    <desc id="vt-d">Three rows. A missense substitution swaps one amino acid. A nonsense substitution turns an amino acid codon into a stop codon, truncating the protein. A deletion of bases not divisible by three shifts the reading frame so everything after is wrong.</desc>
    <g font-size="9" letter-spacing="0.08em" fill="var(--muted)">
      <text x="40" y="34">change</text>
      <text x="170" y="34">DNA</text>
      <text x="350" y="34">what the protein becomes</text>
    </g>
    <text x="40" y="64" font-size="10" fill="var(--ink)">missense</text>
    <text x="170" y="64" font-size="10" fill="var(--ink)">TTT</text>
    <text x="222" y="64" font-size="10" fill="var(--muted)">→</text>
    <text x="246" y="64" font-size="10" fill="var(--ink)">T<tspan fill="var(--brand-green-deep)">C</tspan>T</text>
    <text x="350" y="64" font-size="9.5" fill="var(--muted)">one amino acid swapped (Phe → Ser)</text>
    <line x1="40" y1="88" x2="524" y2="88" stroke="var(--hairline)" stroke-width="1" />
    <text x="40" y="112" font-size="10" fill="var(--ink)">nonsense</text>
    <text x="170" y="112" font-size="10" fill="var(--ink)">TGG</text>
    <text x="222" y="112" font-size="10" fill="var(--muted)">→</text>
    <text x="246" y="112" font-size="10" fill="var(--ink)">TG<tspan fill="var(--brand-green-deep)">A</tspan></text>
    <text x="350" y="112" font-size="9.5" fill="var(--muted)">early stop (the protein is cut short)</text>
    <line x1="40" y1="136" x2="524" y2="136" stroke="var(--hairline)" stroke-width="1" />
    <text x="40" y="160" font-size="10" fill="var(--ink)">frameshift</text>
    <text x="170" y="160" font-size="10" fill="var(--ink)">ATG AAG TTT → AGA AGT TT…</text>
    <text x="350" y="160" font-size="9.5" fill="var(--muted)">frame shifts; everything after is garbage</text>
    <text x="40" y="198" font-size="9.5" fill="var(--muted)">most changes are none of these: intronic, synonymous, or common in healthy populations</text>
  </svg>
  <figcaption><span class="ml-cap-id">Fig. 3 — the variant taxonomy that matters.</span> Most differences from the reference do nothing; the interesting ones do one of these three things to a protein. This is why "consequence" is a *derived annotation*: a feature computed from the base change plus the gene model, which is why annotating is its own stage in every pipeline you'll meet in this series.</figcaption>
</figure>

The word you see everywhere is **consequence**: a derived label, a feature rather than raw data, computed from the base change and the gene model. Two more terms follow from carrying two copies. A change on both copies is `1/1`, **homozygous**; a change on one is `0/1`, **heterozygous**. Some recessive conditions need two different damaged variants, one per copy: **compound heterozygous**. That case gets special treatment in the scoring rules below.

### What MVA is

With that grounding, MVA is where the assumption that a genome is a fixed pair of strings stops holding. The failure is not at the level of one base pair but at the level of whole chromosomes, and it does not affect every cell.

The count first. A healthy human karyotype holds 46 chromosomes in 23 pairs. **Aneuploidy** is a wrong count; the familiar case is trisomy 21 (47 chromosomes instead of 46). MVA is aneuploidy with two modifiers. It is **mosaic** because only some cells carry the wrong count, and **variegated** because the wrong count is not the same everywhere: two cells can be missing different chromosomes.

<figure class="ml-fig" aria-label="Cells from one sample with different chromosome counts">
  <svg viewBox="0 0 560 320" role="img" aria-labelledby="mva-t mva-d">
    <title id="mva-t">One sample, forty cells, different chromosome counts</title>
    <desc id="mva-d">A grid of forty cells from a single tissue sample. Most carry 46 chromosomes; seven carry 45, 47 or 48 and are outlined in green. The chromosome count is a distribution across cells, not one number for the person.</desc>
    <text x="40" y="28" font-size="10" fill="var(--muted)">one sample · 40 cells · the count is not the same in all of them</text>
    <g font-size="9" text-anchor="middle" fill="var(--muted)">
      <circle cx="44" cy="70" r="15" fill="none" stroke="var(--hairline)" /><text x="44" y="73.5">46</text>
      <circle cx="108" cy="70" r="15" fill="none" stroke="var(--hairline)" /><text x="108" y="73.5">46</text>
      <circle cx="172" cy="70" r="15" fill="var(--brand-green)" fill-opacity="0.14" stroke="var(--brand-green)" /><text x="172" y="73.5" fill="var(--ink)">45</text>
      <circle cx="236" cy="70" r="15" fill="none" stroke="var(--hairline)" /><text x="236" y="73.5">46</text>
      <circle cx="300" cy="70" r="15" fill="none" stroke="var(--hairline)" /><text x="300" y="73.5">46</text>
      <circle cx="364" cy="70" r="15" fill="none" stroke="var(--hairline)" /><text x="364" y="73.5">46</text>
      <circle cx="428" cy="70" r="15" fill="none" stroke="var(--hairline)" /><text x="428" y="73.5">46</text>
      <circle cx="492" cy="70" r="15" fill="none" stroke="var(--hairline)" /><text x="492" y="73.5">46</text>
      <circle cx="44" cy="118" r="15" fill="none" stroke="var(--hairline)" /><text x="44" y="121.5">46</text>
      <circle cx="108" cy="118" r="15" fill="var(--brand-green)" fill-opacity="0.14" stroke="var(--brand-green)" /><text x="108" y="121.5" fill="var(--ink)">48</text>
      <circle cx="172" cy="118" r="15" fill="none" stroke="var(--hairline)" /><text x="172" y="121.5">46</text>
      <circle cx="236" cy="118" r="15" fill="none" stroke="var(--hairline)" /><text x="236" y="121.5">46</text>
      <circle cx="300" cy="118" r="15" fill="none" stroke="var(--hairline)" /><text x="300" y="121.5">46</text>
      <circle cx="364" cy="118" r="15" fill="var(--brand-green)" fill-opacity="0.14" stroke="var(--brand-green)" /><text x="364" y="121.5" fill="var(--ink)">47</text>
      <circle cx="428" cy="118" r="15" fill="none" stroke="var(--hairline)" /><text x="428" y="121.5">46</text>
      <circle cx="492" cy="118" r="15" fill="none" stroke="var(--hairline)" /><text x="492" y="121.5">46</text>
      <circle cx="44" cy="166" r="15" fill="none" stroke="var(--hairline)" /><text x="44" y="169.5">46</text>
      <circle cx="108" cy="166" r="15" fill="none" stroke="var(--hairline)" /><text x="108" y="169.5">46</text>
      <circle cx="172" cy="166" r="15" fill="none" stroke="var(--hairline)" /><text x="172" y="169.5">46</text>
      <circle cx="236" cy="166" r="15" fill="none" stroke="var(--hairline)" /><text x="236" y="169.5">46</text>
      <circle cx="300" cy="166" r="15" fill="none" stroke="var(--hairline)" /><text x="300" y="169.5">46</text>
      <circle cx="364" cy="166" r="15" fill="none" stroke="var(--hairline)" /><text x="364" y="169.5">46</text>
      <circle cx="428" cy="166" r="15" fill="var(--brand-green)" fill-opacity="0.14" stroke="var(--brand-green)" /><text x="428" y="169.5" fill="var(--ink)">45</text>
      <circle cx="492" cy="166" r="15" fill="none" stroke="var(--hairline)" /><text x="492" y="169.5">46</text>
      <circle cx="44" cy="214" r="15" fill="none" stroke="var(--hairline)" /><text x="44" y="217.5">46</text>
      <circle cx="108" cy="214" r="15" fill="none" stroke="var(--hairline)" /><text x="108" y="217.5">46</text>
      <circle cx="172" cy="214" r="15" fill="none" stroke="var(--hairline)" /><text x="172" y="217.5">46</text>
      <circle cx="236" cy="214" r="15" fill="var(--brand-green)" fill-opacity="0.14" stroke="var(--brand-green)" /><text x="236" y="217.5" fill="var(--ink)">47</text>
      <circle cx="300" cy="214" r="15" fill="none" stroke="var(--hairline)" /><text x="300" y="217.5">46</text>
      <circle cx="364" cy="214" r="15" fill="none" stroke="var(--hairline)" /><text x="364" y="217.5">46</text>
      <circle cx="428" cy="214" r="15" fill="none" stroke="var(--hairline)" /><text x="428" y="217.5">46</text>
      <circle cx="492" cy="214" r="15" fill="none" stroke="var(--hairline)" /><text x="492" y="217.5">46</text>
      <circle cx="44" cy="262" r="15" fill="var(--brand-green)" fill-opacity="0.14" stroke="var(--brand-green)" /><text x="44" y="265.5" fill="var(--ink)">47</text>
      <circle cx="108" cy="262" r="15" fill="none" stroke="var(--hairline)" /><text x="108" y="265.5">46</text>
      <circle cx="172" cy="262" r="15" fill="none" stroke="var(--hairline)" /><text x="172" y="265.5">46</text>
      <circle cx="236" cy="262" r="15" fill="none" stroke="var(--hairline)" /><text x="236" y="265.5">46</text>
      <circle cx="300" cy="262" r="15" fill="none" stroke="var(--hairline)" /><text x="300" y="265.5">46</text>
      <circle cx="364" cy="262" r="15" fill="none" stroke="var(--hairline)" /><text x="364" y="265.5">46</text>
      <circle cx="428" cy="262" r="15" fill="none" stroke="var(--hairline)" /><text x="428" y="265.5">46</text>
      <circle cx="492" cy="262" r="15" fill="var(--brand-green)" fill-opacity="0.14" stroke="var(--brand-green)" /><text x="492" y="265.5" fill="var(--ink)">45</text>
    </g>
    <g font-size="9" fill="var(--muted)">
      <circle cx="44" cy="300" r="5" fill="var(--brand-green)" fill-opacity="0.5" stroke="var(--brand-green)" />
      <text x="54" y="303.5">aneuploid, 45 / 47 / 48</text>
      <circle cx="292" cy="300" r="5" fill="none" stroke="var(--hairline)" />
      <text x="302" y="303.5">euploid, 46</text>
    </g>
  </svg>
  <figcaption><span class="ml-cap-id">Fig. 4 — mosaic is a modifier on the count.</span> A single sample, forty cells. Both words in the name live in this grid: the abnormal counts are only in some cells (mosaic), and they are not the same in every one of those (variegated).</figcaption>
</figure>

The count is a distribution, not a number. That is what the name says: mosaic variegated aneuploidy, aneuploidy scattered across the body in patterns that vary.

The cause is a weakened **spindle assembly checkpoint**, the machinery inside mitosis that holds a dividing cell still until every chromosome is properly attached before the copies are pulled apart. BUB1B was the first gene tied to MVA; CEP57, TRIP13, BUB3 and others followed. Lose both working copies of one of these and cells begin to mis-segregate chromosomes. Which one, in which cell, on which division: that is where the variegation comes from.

The published picture of the condition is growth delay, developmental differences, and a predisposition to cancer. There is no established treatment; care means managing symptoms and surveillance.

The number of known cases matters here: fewer than 50 worldwide. No cohort to learn from, no training set, no benchmark. Everything downstream runs on priors, published knowledge, and one genome.

### What the task asks

So the question the hackathon puts is direct: given 5,012,204 variants and a clinical description, rank the variant or variants that cause this child's disease. There are two tracks, and I'm spending this series on Track 1.

Track 1 asks for a ranked list of variants with confidence scores, a methods write-up, and a repository. Six submissions, a live leaderboard, and a held-out answer confirmed clinically by the organisers. Two metrics matter.

**Rank Points** is a step function of rank:

- 100 points if your top-ranked variant is the true cause.
- Partial credit if the true variant sits anywhere in your top 10.
- Half credit if the cause is a compound heterozygous pair and you correctly identify one of the two.

The last clause is the case from the biology section: the answer is a set of two rows, and getting one of them right is worth half.

**F-max** is the best F1 score achievable at any confidence threshold applied to your scores. It is not an ordering metric. The numbers you attach to your variants have to work as a decision threshold across the whole list; confidence scores that are just sorted ranks wearing a probability costume are penalised.

Incidental and secondary findings are explicitly welcome and do not hurt the automated score.

Track 2 asks you to characterise the mechanism and propose already approved drugs as follow-up hypotheses, judged by an expert panel on rigour, impact, innovation, and scalability, with one submission and a three-minute video. I may write about that track later in the series.

<figure class="ml-fig" aria-label="Rank Points as a function of the true variant's rank">
  <svg viewBox="0 0 560 230" role="img" aria-labelledby="rp-t rp-d">
    <title id="rp-t">Rank Points collapse outside the top ten</title>
    <desc id="rp-d">A bar at rank 1 reaches the full 100 points. Ranks 2 to 10 are a hatched band whose exact credit is unpublished. From rank 11 onward the score is zero, and a draggable marker shows where the true variant would land.</desc>
    <defs>
      <pattern id="rp-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" stroke="var(--muted)" stroke-width="1.4" opacity="0.55" />
      </pattern>
    </defs>
    <line x1="56" y1="180" x2="524" y2="180" stroke="var(--ink)" stroke-width="1.5" />
    <line x1="56" y1="180" x2="56" y2="34" stroke="var(--ink)" stroke-width="1.5" />
    <text x="48" y="60" text-anchor="end" font-size="10" fill="var(--muted)">100</text>
    <text x="48" y="98" text-anchor="end" font-size="10" fill="var(--muted)">?</text>
    <text x="48" y="176" text-anchor="end" font-size="10" fill="var(--muted)">0</text>
    <text x="20" y="112" text-anchor="middle" font-size="10" fill="var(--muted)" transform="rotate(-90 20 112)">rank points</text>
    <rect x="60" y="60" width="28" height="120" fill="var(--brand-green)" />
    <text x="74" y="52" text-anchor="middle" font-size="10" fill="var(--ink)">100</text>
    <rect x="98" y="104" width="332" height="76" fill="url(#rp-hatch)" stroke="var(--muted)" stroke-width="1" stroke-dasharray="4 3" />
    <text x="264" y="128" text-anchor="middle" font-size="10" fill="var(--ink)">partial credit (schedule not published)</text>
    <line x1="444" y1="34" x2="444" y2="196" stroke="var(--muted)" stroke-width="1" stroke-dasharray="5 4" />
    <text x="450" y="44" font-size="10" fill="var(--muted)">top-10 cutoff</text>
    <text x="474" y="176" text-anchor="middle" font-size="10" fill="var(--muted)">0</text>
    <text x="512" y="176" text-anchor="middle" font-size="10" fill="var(--muted)">0</text>
    <g font-size="9" fill="var(--muted)" text-anchor="middle">
      <text x="74" y="196">1</text>
      <text x="188" y="196">4</text>
      <text x="302" y="196">7</text>
      <text x="416" y="196">10</text>
      <text x="474" y="196">11</text>
      <text x="512" y="196">12</text>
    </g>
    <text x="524" y="214" text-anchor="end" font-size="10" fill="var(--muted)">rank of the true variant →</text>
    <line id="rp-tick" x1="74" y1="34" x2="74" y2="180" stroke="var(--brand-green-deep)" stroke-width="2" />
    <circle id="rp-dot" cx="74" cy="180" r="4" fill="var(--brand-green-deep)" />
  </svg>
  <div class="ml-control">
    <label for="rp-slider">where did your ranking put the true variant?</label>
    <input id="rp-slider" type="range" min="1" max="20" value="1" step="1" aria-describedby="rp-status" />
  </div>
  <div class="ml-readout"><output id="rp-status">rank 1 · 100 points · outranked 5,012,203 variants</output></div>
  <figcaption><span class="ml-cap-id">Fig. 5 — the shape of the score, not the schedule.</span> The rules publish the endpoints (100 at rank 1, partial inside the top 10, nothing beyond), and leave the middle unspecified. Drag the marker and watch what happens at 11.</figcaption>
</figure>

<script>
(function () {
  var s = document.getElementById('rp-slider');
  if (!s) return;
  var TOTAL = 5012204;
  var tick = document.getElementById('rp-tick');
  var dot = document.getElementById('rp-dot');
  var st = document.getElementById('rp-status');
  function slotCenter(r) {
    if (r <= 10) return 74 + (r - 1) * 38;
    // beyond rank 12 every position scores the same, so park the marker there
    return 474 + (Math.min(r, 12) - 11) * 38;
  }
  function render() {
    var r = Number(s.value);
    var x = slotCenter(r);
    tick.setAttribute('x1', x);
    tick.setAttribute('x2', x);
    dot.setAttribute('cx', x);
    var beaten = TOTAL - r;
    var pct = ((beaten / TOTAL) * 100).toFixed(5);
    var points = r === 1 ? '100 points' : r <= 10 ? 'partial credit (unspecified)' : '0 points';
    st.textContent = 'rank ' + r + ' · ' + points + ' · outranked ' +
      beaten.toLocaleString('en-US') + ' of ' + TOTAL.toLocaleString('en-US') +
      ' variants (' + pct + '%)';
  }
  s.addEventListener('input', render);
  render();
})();
</script>

Consider the far end of that axis. If your ranking puts the true variant at position 11, you have correctly outranked 5,012,193 other candidates (99.9998% of everything you were given), and you score zero. Not poorly. Zero. The same as submitting nothing.

A model that is good in the sense you're used to, with decent average precision across five million rows and a well-behaved PR-AUC, can still score zero here. The metric only reads the first ten rows of your list.

### The data you get

Three kinds of input come with Track 1: the raw reads (FASTQ), the called variant set (VCF), and the phenotype. In the order you meet them:

**FASTQ** is the sequencer output: for each read, the base string plus a per-base quality value. Quality is in Phred units, where Q30 means a 1-in-1000 chance that base is wrong; it is a log confidence score attached to every character. The format behaves like an unstructured event stream, billions of rows. In this dataset it is eight gzipped files (four lanes, two mates), tens of gigabytes each. This is the raw-data half of the task.

**VCF** (Variant Call Format) is the other half: a table of differences from the reference. This dataset ships one with 5,012,204 rows. One row looks conceptually like:

```
chr1   13273   G   C   98.2   PASS   ...   GT:AD:DP   0/1:...
```

`CHROM`, `POS`, `REF`, `ALT` means "at chromosome 1, position 13273, the reference has G and this genome has C". The genotype field tells you the two copies: `0/1` is heterozygous, `1/1` homozygous for the alternate. As a DS analogy it is a diff against a canonical record, or an anomaly table. Anomaly is the wrong word, and that is the problem in one line: five million differences from the reference is normal. Every genome has millions of them; almost all are meaningless. The VCF carries its own quality metadata (QUAL, FILTER, and INFO fields like QD and MQ), the diagnostics of the caller that produced it.

Note what the dataset hands you: the raw reads and a precomputed call set. You receive a feature table and the raw events behind it, and you have to decide whether to trust the precomputed one. That decision is familiar.

The third artifact is the phenotype. Alongside the genome is a clinical description of the child, mapped by the organisers into **HPO**, the Human Phenotype Ontology: a controlled vocabulary of clinical findings, each with an ID. I am not going to list this child's terms in public, but the shape matters: instead of free text you get standardised tags. That is what turns "could this variant plausibly explain this presentation?" into a join rather than a vibe, and it is the closest thing to supervision you get.

The dataset itself is about 85 GB compressed, and the guidance is to budget 100–150 GB for caches and intermediates. My working directory is at 158 GB: reads, the reference, the call set, and a 20 GB annotation cache. This is not a laptop project. Post three is partly about the engineering that fact forces on you.

### What comes next

Four more posts, roughly in this order, published as the work reaches each stage rather than on a schedule:

- **Post 2**: the standard pipeline for this problem (QC, align, call, annotate, prioritize), told as a data pipeline, with the DS analogues where they are exact and where they are only suggestive.
- **Post 3**: the same pipeline as a DAG: the engineering, the caching, the failure modes, and what the platform work I do for a living turns out to be worth here.
- **Post 4**: the design space for the ranker and how I'm choosing within it: what I optimised for, and what I deliberately gave up.
- **Post 5**: after 24 October, when the leaderboard freezes and the repository goes public: what I submitted, what happened, and what I would do differently.

If you are a data scientist and you read this thinking you couldn't do that, the next four posts are the argument that you could. You already have the ranking, calibration, and pipeline skills; the remaining work is reading.

If you want the material that made this legible to me before post two arrives: [learngenomics.dev](https://learngenomics.dev/) is the place to start, and the [hackathon space](https://sagebio-rare-disease-real-kid-mva-hackathon-2026.hf.space/) has the official rules, which beat my summary of them every time.

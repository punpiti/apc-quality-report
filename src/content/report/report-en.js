export const en = {
  title: "Higher journal fees are associated with more citations, but price is not a quality score",
  introduction: "We compare advertised article processing charges (APCs) with citations, publication volume, OpenAlex-derived quartiles, and curated journal lists to understand what higher-priced journals have in common.",
  summary: (journals) => `Higher-priced journals tend to have more highly cited work accumulated over their history. Their relationship with citations to recent work is weaker. The analysis covers ${journals} journals with recorded APCs.

- When each measure is examined separately, h-index has the strongest relationship with price (0.64). It reflects how much highly cited work a journal has accumulated.
- Higher total citations and larger publication volumes also tend to accompany higher prices, with correlations of 0.63 and 0.55. Price is therefore associated with journal size and accumulated output as well as citations.
- The relationship with average citations to work in the two-year window is weaker (0.34). Paying more does not reliably identify journals whose recent work receives more citations.
- The median APC is $3,280 for the highest-cited quarter within each field (Q1), compared with $1,500 for the lowest quarter (Q4), about 2.2 times as much. Higher Norway, JUFO, and ABDC levels have median prices roughly $500–$600 higher than their lower comparison groups.
- When several variables are considered together, two-year mean citedness remains positively associated with price, while h-index becomes slightly negatively associated. The separate h-index correlation does not establish why a publisher charges more. Publisher costs and pricing policies were not measured.`,
  interpretation: `## Measures associated with higher fees

When journals are compared one measure at a time, higher values of the following measures tend to accompany higher APCs. The strength of the relationship differs by measure.

- h-index reflects the volume of highly cited work accumulated by a journal. Higher h-index tends to accompany higher fees, with the strongest correlation among these five measures (0.64).
- Lifetime citations count how often all of the journal's work has been cited in total. More accumulated citations tend to accompany higher fees (0.63).
- i10-index counts works with at least 10 citations. Journals with more such works tend to charge more (0.61).
- Works count measures the total number of publications linked to the journal. Journals with more publications tend to charge more (0.55).
- Two-year mean citedness measures average citations to work in the two-year window. Higher values tend to accompany higher fees, but this relationship is weaker than the four accumulated measures above (0.34).

The numbers are Spearman rank correlations. If journals are ordered from the lowest to the highest price, the correlation describes how closely the other measure follows the same order. Values near 1 indicate a stronger shared ordering; values near 0 indicate little shared ordering. A value of 0.64 does not mean that fees increase by 64%, that price explains 64% of quality, or that one additional h-index point increases the fee by a specified dollar amount.

### Accumulated measures also reflect journal size and age

Older journals and journals publishing more work have more opportunities to accumulate citations. In this dataset, h-index correlates with publication volume at 0.83, and journals that began publishing earlier tend to have higher h-indices. The h-index–price relationship therefore overlaps with differences in size and age.

### The h-index relationship changes when variables are considered together

An additional model accounts for field, publication volume, open-access status, DOAJ membership, and CWTS Core membership in the same analysis. Two-year mean citedness remains positively associated with price, while h-index becomes slightly negatively associated. The separate correlation of 0.64 cannot identify h-index as an independent reason for higher fees.

The model does not measure publisher costs, reputation, or pricing policies. It describes characteristics that higher-priced journals share, without establishing why their publishers set those prices.`,
  quartiles: `## The median fee for Q1 is about twice that for Q4

Within each field, journals are divided into four groups according to two-year mean citedness. Q1 is the highest-cited 25% and Q4 is the lowest-cited 25%. Pooling the journals assigned to each group gives a median APC of $3,280 per article in Q1 and $1,500 in Q4.

The medians for Q2 and Q3 are $3,160 and $2,990. The price gap is largest between Q4 and the other groups; it does not increase evenly with each step in rank. Individual prices vary, so a Q1 journal need not charge more than every Q4 journal.

These quartiles were calculated from OpenAlex to compare journals within the same field. They differ from Scopus/SCImago and Journal Citation Reports quartiles. The bootstrap 95% intervals for the group medians are $3,190–$3,290 for Q1 and $1,307–$1,680 for Q4.`,
  lists: `## Higher curated levels have somewhat higher median fees

Norway refers to Norway's register of academic publication channels. JUFO is Finland's publication-channel classification, and ABDC is an Australian list of business-related journals. Median fees broadly follow the levels in each system, although the price ranges overlap substantially.

- Norway level 2 has a median APC about $528 higher than level 1.
- JUFO level 3 has a median APC about $635 higher than level 1.
- ABDC A* has a median APC about $610 higher than C.

Each list uses its own criteria and covers a different population. The levels are explained in the glossary below.

Journals in CWTS Core have a median APC of $3,137, compared with $200 outside the list. The groups contain different types of journals, and APC coverage is incomplete. This gap cannot be interpreted as a price increase caused by entering the list.`,
  fields: `## The price–citation relationship varies across fields

Among the fields shown here, Business, Management and Accounting has the strongest relationship between APC and two-year mean citedness (0.61). Arts and Humanities and Computer Science have much weaker relationships, around 0.12–0.14. A relationship averaged across all fields therefore gives limited guidance about a particular journal.

The chart compares fields with at least 250 journals with recorded APCs. The underlying data also contain results for smaller fields with at least 50 journals.`,
  glossary: `## Glossary and journal classification systems

### Norway or Norwegian Register

The [Norwegian Register for Scientific Journals, Series and Publishers](https://kanalregister.hkdir.no/en/informasjonsartikler/levels-and-changes-in-levels) is maintained by the Norwegian Directorate for Higher Education and Skills (HK-dir). Norway in this report means a journal's register membership, regardless of the country in which the journal is based. Level 1 denotes an approved academic publication channel; level 2 is the highest and more selective level. Level 0 denotes a channel that has not met the approval criteria. This analysis compares levels 1 and 2 recorded in OpenAlex.

### JUFO or Publication Forum

[JUFO](https://julkaisufoorumi.fi/en/publication-forum) is short for Julkaisufoorumi, Finland's classification of journals, book series, conferences, and publishers. Discipline-specific expert panels assess the channels. The edition loaded into OpenAlex for this report includes level 1 (basic), level 2 (leading), and level 3 (top). The classification reflects a channel's average standing and is intended for evaluating large publication volumes. [JUFO will remove level 3 from the beginning of 2027](https://julkaisufoorumi.fi/en/faq-0), so this report describes the 2026 edition.

### ABDC Journal Quality List

The [ABDC Journal Quality List](https://abdc.edu.au/abdc-journal-quality-list/) is maintained by the Australian Business Deans Council. It covers business, economics, management, information systems, and related disciplines. The 2025 review combines expert assessment, citation measures, and other journal lists. Its categories run from A* (highest), through A and B, to C. The 2025 guidelines place A* around the top 5–7% within a Field of Research; C covers the remaining recognized quality journals. Its disciplinary scope differs from an all-field quartile system.

### Source list and publication channel

An OpenAlex *source list* is a journal list maintained by an external organization. OpenAlex matches it to sources by ISSN and records membership in listed_in. A *publication channel* is a venue for research, such as a journal, book series, conference, or publisher. Membership reflects the maintainer's criteria and the loaded edition. OpenAlex does not endorse the lists.

### CWTS Core, DOAJ, and MEDLINE

*CWTS Core* is a set of publication sources across fields maintained by the Centre for Science and Technology Studies at Leiden University for the Leiden Ranking Open Edition. It is distinct from the Web of Science Core Collection.

*[DOAJ](https://doaj.org/apply/guide/)*, the Directory of Open Access Journals, indexes fully open-access journals meeting criteria for transparency, editorial processes, and disclosure of charges. Membership describes publishing practices and open-access status, rather than a citation-impact ranking.

*[MEDLINE](https://www.nlm.nih.gov/medline/medline_journal_selection.html)* is the U.S. National Library of Medicine's bibliographic database for biomedicine and life sciences. Journal selection reviews scope, scientific quality, editorial policies, and production. It is a selective, field-specific list.

### APC, list price, and open-access models

*APC* means article processing charge: a fee charged to publish an article with open access. This report uses the advertised *list price*, converted to US dollars. The amount an author pays can differ because of waivers, discounts, or institutional agreements.

In this report, *gold open access* refers to journals whose articles are all immediately open. *Hybrid open access* refers to open articles in subscription journals, often enabled by an optional APC. *Diamond open access* refers to fully open journals that do not charge authors APCs. An OpenAlex APC of zero records a zero price, but that field alone does not fully establish the diamond model.

### h-index, i10-index, and citation measures

A journal has an *h-index* of h if at least h of its works have each received at least h citations. For example, h=20 means it has at least 20 works with at least 20 citations each. The measure combines accumulated publication volume and citations, making it sensitive to journal age and size.

*i10-index* counts works with at least 10 citations. *Lifetime citations* count citations to all linked works, while *works count* is the number of works OpenAlex links to the journal. All three are influenced by the journal's accumulated output.

OpenAlex's *two-year mean citedness* measures average citations to work in a two-year window. It emphasizes more recent output than h-index. We retain the OpenAlex name because its data and counting procedures differ from Clarivate's Journal Impact Factor.

### Q1–Q4 in this report

A *quartile* divides a ranked population into four groups. Q1 is the highest 25% and Q4 the lowest 25%. This report computes quartiles from two-year mean citedness within each journal's dominant OpenAlex field. These *OpenAlex-derived quartiles* differ from JCR, Scopus, and SCImago quartiles.

A journal's *dominant OpenAlex field* is taken from the topic associated with the largest number of its works. This enables within-field comparisons, but reduces a multidisciplinary journal to one field.

### T1 or Tier 1, and its difference from TCI

*Tier* means a level or group, and T1 needs the definition used by the organization concerned. In [Kasetsart University's 2026 APC funding announcement](https://www3.rdi.ku.ac.th/?p=96160), Tier 1 means the top 10% of journals within a field according to Scopus CiteScore Percentile.

In a field with 100 journals, the top 10% corresponds to roughly the first 10 journals, while Q1 covers roughly the first 25. When the measure, field, and year are the same, the top 10% is a subset of Q1. The term T1 does not imply universal definitions of T2–T4.

*TCI tiers 1–3* are the Thai-Journal Citation Index Centre's journal quality groups, based on publishing criteria and scores in its [2025–2029 evaluation framework](https://tci-thailand.org/backend/download/Evaluation_5/EvaluationRound5.pdf). These groups use different criteria from Scopus top-10% rankings.

This report does not join Scopus CiteScore Percentile or TCI classification data, so it contains no APC comparison for either type of T1. Its OpenAlex-derived quartiles cannot establish eligibility for KU funding.

### Spearman ρ, median, IQR, and uncertainty

*Spearman ρ* is a rank correlation ranging from −1 to 1. Positive values mean that higher values of one variable tend to accompany higher values of the other. Values near zero indicate little shared rank ordering. It measures association and does not establish causation.

The *median* is the middle value after observations are sorted. The *interquartile range (IQR)* runs from the 25th to the 75th percentile, covering the middle half of observations. A *bootstrap 95% interval* uses repeated resampling to estimate uncertainty in a statistic. An interval for the median is different from a range containing the prices of 95% of journals.

### Fixed effects, robust standard errors, and sensitivity model

*Field fixed effects* are variables for individual fields that account for their average differences in a model. *HC1 robust standard errors* adjust estimated uncertainty when the residual variance differs across observations. A *sensitivity model* checks whether the direction of an association persists after adding controls. These methods assess the stability of the result without establishing a causal effect.`,
  methods: (journals) => `## Methods and limitations

### Data and population

We retrieved [OpenAlex Sources API](https://help.openalex.org/data/sources/) records on 14 October 2026 using complete cursor pagination for sources with type=journal and apc_usd equal to or greater than zero. The population contains ${journals} journals, with no duplicate OpenAlex IDs. APCs are current advertised prices converted to USD by OpenAlex, based on DOAJ and curated data. They exclude waivers, discounts, institutional agreements, and the amounts authors actually paid.

### Measures and quartiles

We used [two-year mean citedness, h-index, i10-index, lifetime citations, and works count](https://help.openalex.org/data/common-attributes/) from each source record. Q1–Q4 were calculated from two-year mean citedness within the dominant OpenAlex field, with Q1 representing the highest 25%. Field assignment uses the topic associated with the most works, which may misrepresent multidisciplinary or older journals.

### Statistics

We used Spearman rank correlation because APCs and citation measures have strongly skewed distributions. Quartile medians use 2,000 bootstrap resamples for 95% intervals. The sensitivity model uses log APC for positive prices only. It includes log(1+h-index), log(1+two-year mean citedness), log(1+works count), OA status, DOAJ and CWTS Core membership, and field fixed effects, with HC1 robust standard errors. The three continuous predictors are standardized to a mean of zero and a standard deviation of one. The model checks the association under these controls without identifying causes.

### Coverage and selection

OpenAlex has 217,114 journal sources; 88,583 have their most recent publication in 2025–2026. Of these active journals, only 14,074 (15.9%) have a recorded APC. [OpenAlex notes](https://help.openalex.org/data/sources/) that coverage favors fully open-access journals and is thinner for hybrid journals. The results describe journals with APC records and do not represent all journals equally.

### Curated lists

Membership comes from [OpenAlex source lists](https://help.openalex.org/data/source-lists/), which record editions of CWTS Core, DOAJ, MEDLINE, the Norwegian Register, JUFO, and ABDC. External organizations define these lists; membership is not an OpenAlex endorsement of journal quality.

### Scope of the conclusions

All results are cross-sectional journal-level associations. Higher APCs may coincide with differences in publisher, field, open-access model, age, size, reputation, and pricing power. The evidence shows that APC and citation measures tend to rise together on average. It does not establish that raising an APC improves quality, or that a more expensive journal is always a better choice.`,
};

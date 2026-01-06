// Migrated from tikz.gs

export const SNIPPET_HINH_PHANG = `%% =============== HÌNH HỌC PHẲNG ===============
% -- Vẽ tam giác ABC
\\draw(A)--(B)--(C)--cycle;
\\draw (A)--(vuonggoc cs:from=A, on=B--C) coordinate(H);
\\coordinate(M) at ($(B)!0.5!(C)$); \\draw (A)--(M);
\\foreach \\i/\\g in {A/90,B/-90,C/-90,H/-90}{ \\draw[fill=white](\\i) circle (1.5pt) ($( \\i )+(\\g:3mm)$) node[scale=1]{$\\i$}; }
\\coordinate (A) at (0,5); \\coordinate (B) at (-2,0); \\coordinate (C) at (2,0); \\draw(A)--(B)--(C)--cycle;
\\def\\canh{5} \\coordinate (B) at (0,0); \\coordinate (C) at (\\canh,0); \\coordinate (A) at ($(B) + (60:\\canh)$); \\draw(A)--(B)--(C)--cycle;
\\path[name path=T] (A) circle (3 cm);
\\coordinate (O) at (intersection of A--B and C--D);
\\coordinate (A) at (1,3); \\coordinate (B) at (4,3); \\coordinate (D) at (0,0); \\coordinate (C) at (5,0); \\draw(A)--(B)--(C)--(D)--cycle;
\\coordinate (A) at (0,3); \\coordinate (B) at (5,3); \\coordinate (D) at (0,0); \\coordinate (C) at ($(B)+(D)-(A)$); \\draw(A)--(B)--(C)--(D)--cycle;
`;

export const SNIPPET_HINH_KHONG_GIAN = `%% =============== HÌNH KHÔNG GIAN ===============
% -- Vẽ hình nón
\\begin{tikzpicture}[line join=round, line cap=round, font=\\scriptsize]
  \\def\\a{2} \\def\\b{1} \\def\\h{4}
  \\draw[dashed] (180:\\a) arc (180:0:{\\a} and {\\b}) (90:\\h)--(0,0) node[midway,right]{$h$} (0,0)--(0:\\a);
  \\draw (-\\a,\\h)--(-\\a,0) arc (180:360:{\\a} and {\\b})--(\\a,\\h) node[midway,right]{$l$} (90:\\h) ellipse ({\\a} and {\\b}) (90:\\h)--(\\a,\\h) node[midway,above]{$r$};
\\end{tikzpicture}
% -- Vẽ hình trụ
\\begin{tikzpicture}[line join=round, line cap=round, font=\\scriptsize]
  \\def\\a{2} \\def\\b{1} \\def\\h{3}
  \\pgfmathsetmacro\\g{asin(\\b/\\h)} \\pgfmathsetmacro\\xo{\\a*cos(\\g)} \\pgfmathsetmacro\\yo{\\b*sin(\\g)}
  \\draw[dashed](\\xo,\\yo) arc (\\g:180-\\g:{\\a} and {\\b})(180:\\a)--(0,0) node[midway,below]{$r$} (0,0)--(0:\\a) (90:\\h)--(0,0) node[midway,right]{$h$};
  \\draw (90:\\h)--(-\\xo,\\yo) node[midway,slopped,above]{$l$} arc(180-\\g:360+\\g:{\\a} and {\\b})--cycle;
\\end{tikzpicture}
% -- Vẽ hình chóp tam giác đều S.ABC
\\begin{tikzpicture}[scale=1, font=\\footnotesize, line join=round, line cap=round, >=stealth]
  \\def\\ac{4} \\def\\ab{2} \\def\\h{4} \\def\\gocA{50}
  \\coordinate[label=left:$A$] (A) at (0,0); \\coordinate[label=right:$C$] (C) at (\\ac,0); \\coordinate[label=below left:$B$] (B) at (-\\gocA:\\ab);
  \\coordinate (M) at ($(B)!.5!(C)$); \\coordinate[label=below right:$O$] (G) at ($(A)!2/3!(M)$);
  \\coordinate[label=above:$S$] (S) at ($(G)+(90:\\h)$);
  \\draw (A)--(B)--(C)--(S)--cycle (S)--(B); \\draw[dashed] (A)--(C) (S)--(G);
\\end{tikzpicture}
`;

export const SNIPPET_DO_THI = `%% =============== ĐỒ THỊ HÀM SỐ ===============
% -- Đồ thị hàm số bậc hai y = x^2 + 2x + 3
\\begin{tikzpicture}[line join=round, line cap=round, >=stealth, thin]
  \\draw[->] (-4.1,0)--(4.1,0) node[below left] {$x$};
  \\draw[->] (0,-4.1)--(0,4.1) node[below left] {$y$};
  \\draw (0,0) node[below left] {$O$};
  \\begin{scope}
    \\clip (-4,-4) rectangle (4,4);
    \\draw[samples=200, domain=-3:3, smooth, variable=\\x] plot (\\x, {(\\x)^2 + 2*(\\x) + 3});
  \\end{scope}
\\end{tikzpicture}
% -- Đồ thị hàm phân thức
\\begin{tikzpicture}[scale=1, font=\\footnotesize, line join=round, line cap=round, >=stealth]
  \\def\\xmin{-4} \\def\\xmax{2} \\def\\ymin{-3} \\def\\ymax{3}
  \\draw[->] (\\xmin-0.2,0)--(\\xmax+0.2,0) node[below] {$x$}; \\draw[->] (0,\\ymin-0.2)--(0,\\ymax+0.2) node[right] {$y$};
  \\clip (\\xmin,\\ymin) rectangle (\\xmax,\\ymax);
  \\draw[dashed] (\\xmin,0.33)--(\\xmax,0.33); \\draw[dashed] (-0.67,\\ymin)--(-0.67,\\ymax);
  \\draw[smooth,samples=200,domain=\\xmin:-0.77] plot (\\x,{(\\x+1)/(3*\\x+2)});
  \\draw[smooth,samples=200,domain=-0.57:\\xmax] plot (\\x,{(\\x+1)/(3*\\x+2)});
\\end{tikzpicture}
`;

export const SNIPPET_BANG_BIEN_THIEN = `%% =============== BẢNG BIẾN THIÊN ===============
\\begin{tikzpicture}
  \\tkzTabInit[nocadre,lgt=1.5,espcl=5,deltacl=0.6]
     {$x$/0.7,$y'$/0.7,$y$/2}{$-\\infty$,$-1$,$+\\infty$}
  \\tkzTabLine{,-,0,+,}
  \\tkzTabVar{+/$+\\infty$,-/$2$,+/$+\\infty$} 
\\end{tikzpicture}
`;

export const SNIPPET_TRUC_SO = `%% =============== TRỤC SỐ ===============
\\begin{tikzpicture}[line join=round, line cap=round, >=stealth, thick]
  \\fill[pattern=north east lines](-4,-0.15) rectangle (-1.5,0.15);
  \\draw[->] (-4,0)--(4,0);
  \\draw (-1.5,0) node {$\\big($} (-1.5,0) node[below=6pt] {$a$};
  \\draw (0.75,0) node {$\\big]$} (0.75,0) node[below=6pt] {$b$};
\\end{tikzpicture}
`;

export const SNIPPET_BIEU_DO = `%% =============== BIỂU ĐỒ ===============
\\begin{tikzpicture}[scale=.5,font=\\scriptsize]
  \\draw[->] (0,0)--(16,0) node[below]{$x$}; \\draw[->] (0,0)--(0,5.5) node[left]{$n$};
  \\foreach \\x/\\n[count=\\i from 1] in {10/3,12/4,15/5}{
    \\draw[line width=4mm,magenta] (\\i,0) node[below, black]{$\\x$} --++(0,\\n);
    \\draw[dashed] (\\i,\\n)--(0,\\n) node[left]{$\\n$};
  }
\\end{tikzpicture}
`;

export const getMinimalTikzFallback = (category: string) => {
  if (category === 'do_thi') {
    return `% Đồ thị parabol cơ bản
\\begin{tikzpicture}[scale=0.8]
  \\draw[->] (-2,0)--(2,0) node[right]{$x$};
  \\draw[->] (0,-1)--(0,3) node[above]{$y$};
  \\draw[domain=-1.5:1.5,smooth,variable=\\x] plot (\\x,{(\\x)^2});
\\end{tikzpicture}`;
  }
  return `% Tam giác cơ bản
\\begin{tikzpicture}[scale=0.8]
  \\coordinate (A) at (0,0);
  \\coordinate (B) at (4,0);
  \\coordinate (C) at (1.6,2.6);
  \\draw (A)--(B)--(C)--cycle;
  \\node[below] at (A){A};\\node[below] at (B){B};\\node[above] at (C){C};
\\end{tikzpicture}`;
};

export const analyzeProblemForTikz = (problemContent: string): string => {
  const s = (problemContent || '').toLowerCase();
  
  const map: {[key: string]: string[]} = {
    hinh_phang: ['tam giác','tứ giác','đường tròn','hình tròn','hình chữ nhật','đa giác','góc','cạnh'],
    hinh_khong_gian: ['hình nón','hình trụ','hình cầu','chóp','lăng trụ','khối'],
    do_thi: ['đồ thị','parabol','hàm số','bậc hai','bậc ba','logarit','mũ','đường cong'],
    bang_bien_thien: ['bảng biến thiên','xét dấu','tăng giảm','cực trị'],
    truc_so: ['trục số','khoảng nghiệm','bất phương trình'],
    bieu_do: ['biểu đồ','thống kê','cột','tròn','tỷ lệ']
  };

  for (const [cat, arr] of Object.entries(map)) {
    if (arr.some(k => s.includes(k))) return cat;
  }
  return 'hinh_phang';
};

export const getTikzSnippetsForQuery = (query: string): string => {
  const queryLower = query.toLowerCase();
  let relevantSnippets: string[] = [];
  
  const tikzKeywords = ['tikz', 'vẽ', 'draw', 'hình', 'đồ thị', 'biểu đồ', 'bảng biến thiên'];
  const hasTikzKeyword = tikzKeywords.some(keyword => queryLower.includes(keyword));
  
  if (!hasTikzKeyword && !queryLower.includes('tam giác') && !queryLower.includes('cho')) {
     // Loose check, if it's math, it might need tikz
  }

  if (queryLower.match(/tam giác|hình vuông|hình tròn|đường tròn|hình chữ nhật|hình thoi|hình bình hành/)) {
    relevantSnippets.push(SNIPPET_HINH_PHANG);
  }
  if (queryLower.match(/hình nón|hình trụ|hình cầu|lăng trụ|hình chóp|hình hộp/)) {
    relevantSnippets.push(SNIPPET_HINH_KHONG_GIAN);
  }
  if (queryLower.match(/đồ thị|hàm số|bậc hai|bậc ba|phân thức|parabol/)) {
    relevantSnippets.push(SNIPPET_DO_THI);
  }
  if (queryLower.match(/bảng biến thiên|biến thiên|cực trị|đạo hàm/)) {
    relevantSnippets.push(SNIPPET_BANG_BIEN_THIEN);
  }
  if (queryLower.match(/trục số|xét dấu|nghiệm|khoảng/)) {
    relevantSnippets.push(SNIPPET_TRUC_SO);
  }
  if (queryLower.match(/biểu đồ|thống kê|cột|tròn/)) {
    relevantSnippets.push(SNIPPET_BIEU_DO);
  }

  if (relevantSnippets.length === 0) {
    // Default fallback if ambiguous but likely geometry
    return getMinimalTikzFallback('hinh_phang');
  }

  return relevantSnippets.join('\n\n');
};

export const getDynamicTikzSnippets = (category: string, ctx: string = ''): string => {
  let s = '';
  switch (category) {
    case 'hinh_phang': s = SNIPPET_HINH_PHANG; break;
    case 'hinh_khong_gian': s = SNIPPET_HINH_KHONG_GIAN; break;
    case 'do_thi': s = SNIPPET_DO_THI; break;
    case 'bang_bien_thien': s = SNIPPET_BANG_BIEN_THIEN; break;
    case 'truc_so': s = SNIPPET_TRUC_SO; break;
    case 'bieu_do': s = SNIPPET_BIEU_DO; break;
  }
  
  if (!s) s = getTikzSnippetsForQuery(ctx || category);
  if (!s) s = getMinimalTikzFallback(category);
  return s;
};
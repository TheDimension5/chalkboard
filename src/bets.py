# "Place your bet" boxes: a question, a few answers, a reveal. Wired by Chalk.bet(id, ...) in the board's sims file.
import html as _h
def bet(id,question,opts,title='Place your bet'):
    btns=''.join(f'<button class="btn" type="button" data-bet="{v}">{_h.escape(l)}</button>' for v,l in opts)
    return f'<div class="bet" id="{id}"><p class="bet-q"><b>{title}</b><span>{_h.escape(question)}</span></p><div class="row">{btns}</div><p class="bet-out" aria-live="polite" hidden></p></div>\n    '

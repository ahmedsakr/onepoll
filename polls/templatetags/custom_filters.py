from django import template
register = template.Library()

@register.filter
def percentage(value, arg):
    try:
        value = float(value)
        arg = float(arg)

        if arg:
            return round(value / arg * 100, 1)
    except:
        pass
    return ''

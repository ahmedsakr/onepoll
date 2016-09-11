def pluralize(num):
    if num != 1:
        return 's'
    else:
        return ''

def percentage(num, total):
    return (float(num) / total) * 100

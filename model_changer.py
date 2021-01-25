"""
Изменение файла db.json с дампом базы данных со сменой названия модели
"""

old_filename = 'db_dump\\django_db_main_weimermodelconstants.sql'
new_filename='db_dump\\dump2.sql'
old_model = 'main_weimermodelconstants'
new_model = 'main_page_weimermodelconstants'

with open(old_filename, 'r') as old_file, open(new_filename, 'w') as new_file:
    for line in old_file:
        new_file.write(line.replace(old_model, new_model))
print('end')